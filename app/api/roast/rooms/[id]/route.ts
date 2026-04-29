import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const { name } = await req.json();

    // Check if user is a member (or Ringmaster)
    const membership = await prisma.roastRoomMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId } }
    });

    if (!membership || membership.role !== "Ringmaster") {
      return new NextResponse("Only the Ringmaster can edit the arena.", { status: 403 });
    }

    const room = await prisma.roastRoom.update({
      where: { id: params.id },
      data: { name }
    });

    return NextResponse.json({ room });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const membership = await prisma.roastRoomMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId } }
    });

    if (!membership || membership.role !== "Ringmaster") {
      return new NextResponse("Only the Ringmaster can dismantle the arena.", { status: 403 });
    }

    await prisma.roastRoom.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
