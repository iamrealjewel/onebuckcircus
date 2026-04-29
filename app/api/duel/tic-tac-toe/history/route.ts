import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const opponentId = searchParams.get("opponentId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const where: any = {
      OR: [
        { player1Id: userId },
        { player2Id: userId }
      ],
      status: { in: ["COMPLETED", "ABANDONED"] }
    };

    if (opponentId) {
      where.AND = [
        { OR: [{ player1Id: opponentId }, { player2Id: opponentId }] }
      ];
    }

    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) where.updatedAt.gte = new Date(startDate);
      if (endDate) where.updatedAt.lte = new Date(endDate);
    }

    const history = await prisma.ticTacToeDuel.findMany({
      where,
      include: {
        player1: { select: { id: true, name: true, points: true, gender: true } },
        player2: { select: { id: true, name: true, points: true, gender: true } }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json(history);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
