import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const pendingDuel = await prisma.ticTacToeDuel.findFirst({
      where: {
        player2Id: userId,
        status: "PENDING"
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ duel: pendingDuel });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
