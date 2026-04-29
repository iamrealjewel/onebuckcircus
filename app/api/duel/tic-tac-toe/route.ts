import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// --- SERVER-SIDE WIN CHECKER ---
const checkWinner = (sq: (string | null)[]) => {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let l of lines) {
    const [a,b,c] = l;
    if (sq[a] !== null && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
  }
  const occupiedCount = sq.filter(s => s !== null).length;
  if (occupiedCount === 9) return "draw";
  return null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { action, duelId, board, winnerId, opponentId, avatarId } = await req.json();
    const userId = (session.user as any).id;

    if (action === "CREATE") {
      const duel = await prisma.ticTacToeDuel.create({
        data: {
          player1Id: userId,
          player2Id: opponentId,
          turnId: userId,
          status: "PENDING"
          // In a real expanded schema, we'd save p1AvatarId: avatarId
        }
      });
      return NextResponse.json(duel);
    }

    if (action === "UPDATE") {
      const duel = await prisma.ticTacToeDuel.findUnique({ 
        where: { id: duelId },
        include: { player1: true, player2: true } 
      });
      
      if (!duel) return new NextResponse("Duel not found", { status: 404 });
      if (duel.status !== "ACTIVE") return new NextResponse("Game not active", { status: 400 });

      // Validation: Ensure it is actually the user's turn
      if (duel.turnId !== userId) return new NextResponse("Not your turn", { status: 403 });

      const nextTurnId = userId === duel.player1Id ? duel.player2Id : duel.player1Id;
      
      // SERVER-SIDE WIN CHECK
      const winResult = checkWinner(board);
      const isGameOver = !!winResult;

      let finalWinnerId = null;
      if (winResult === "X") finalWinnerId = duel.player1Id;
      if (winResult === "O") finalWinnerId = duel.player2Id;

      // UPDATE RANKING DATA IF GAME IS OVER
      if (isGameOver) {
        if (finalWinnerId) {
          const loserId = finalWinnerId === duel.player1Id ? duel.player2Id : duel.player1Id;
          
          // Winner: +20 points, +1 win
          await prisma.user.update({
            where: { id: finalWinnerId },
            data: { points: { increment: 20 }, wins: { increment: 1 } }
          });

          // Loser: -10 points (min 0), +1 loss
          const loser = await prisma.user.findUnique({ where: { id: loserId } });
          const newLoserPoints = Math.max(0, (loser?.points || 0) - 10);
          await prisma.user.update({
            where: { id: loserId },
            data: { points: newLoserPoints, losses: { increment: 1 } }
          });
        } else if (winResult === "draw") {
          // Draw: +5 points for both
          await prisma.user.updateMany({
            where: { id: { in: [duel.player1Id, duel.player2Id] } },
            data: { points: { increment: 5 } }
          });
        }
      }

      const updated = await prisma.ticTacToeDuel.update({
        where: { id: duelId },
        data: {
          board: board.join(","),
          turnId: isGameOver ? duel.turnId : nextTurnId,
          winnerId: finalWinnerId,
          status: isGameOver ? "COMPLETED" : "ACTIVE"
        }
      });
      
      return NextResponse.json(updated);
    }

    if (action === "ACCEPT") {
      const updated = await prisma.ticTacToeDuel.update({
        where: { id: duelId },
        data: { status: "ACTIVE" }
      });
      return NextResponse.json(updated);
    }

    if (action === "REJECT") {
      await prisma.ticTacToeDuel.update({
        where: { id: duelId },
        data: { status: "REJECTED" }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "CANCEL") {
      await prisma.ticTacToeDuel.delete({ where: { id: duelId } });
      return NextResponse.json({ success: true });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error: any) {
    console.error("DUEL_ERROR:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const duelId = searchParams.get("duelId");
  if (!duelId) return new NextResponse("Missing duelId", { status: 400 });

  try {
    const duel = await prisma.ticTacToeDuel.findUnique({
      where: { id: duelId },
      include: {
        player1: { select: { id: true, name: true, image: true, gender: true, points: true, wins: true, losses: true, preferredAvatar: true } },
        player2: { select: { id: true, name: true, image: true, gender: true, points: true, wins: true, losses: true, preferredAvatar: true } }
      }
    });
    return NextResponse.json(duel);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
