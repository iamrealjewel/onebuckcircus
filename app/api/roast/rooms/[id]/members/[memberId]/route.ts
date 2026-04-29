import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string, memberId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const { role, avatar } = await req.json();

    // Check if user is updating themselves or if they are the ringmaster updating others
    const myMembership = await prisma.roastRoomMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId } }
    });

    if (!myMembership) return new NextResponse("Forbidden", { status: 403 });

    const isSelf = myMembership.id === params.memberId;
    const isRingmaster = myMembership.role === "Ringmaster";

    if (!isSelf && !isRingmaster) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedMember = await prisma.roastRoomMember.update({
      where: { id: params.memberId },
      data: { 
        ...(role && { role }),
        ...(avatar && { avatar })
      }
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
