import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const leaderboard = await prisma.user.findMany({
      orderBy: {
        points: 'desc'
      },
      take: 50,
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        wins: true,
        losses: true,
        gender: true
      }
    });

    // Mocking shifts for UI demonstration
    // In a real app, you'd compare with a historical snapshot
    const leaderboardWithShifts = leaderboard.map((u, i) => ({
      ...u,
      // Randomly assign shifts for UI feedback: -1 (down), 0 (stable), 1 (up)
      shift: i % 3 === 0 ? 1 : i % 5 === 0 ? -1 : 0
    }));

    return NextResponse.json(leaderboardWithShifts);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
