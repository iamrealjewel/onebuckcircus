import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { avatarId } = await req.json();
    if (!avatarId) {
      return NextResponse.json({ error: "Avatar ID is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { preferredAvatar: avatarId },
    });

    return NextResponse.json({ success: true, avatarId: updatedUser.preferredAvatar });
  } catch (error: any) {
    console.error("AVATAR_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
