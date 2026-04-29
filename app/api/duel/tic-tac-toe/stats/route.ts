import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        points: true,
        wins: true,
        losses: true,
        name: true,
        gender: true
      }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    return NextResponse.json(user);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
