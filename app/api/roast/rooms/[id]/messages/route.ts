import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const messages = await prisma.roastMessage.findMany({
      where: { roomId: params.id },
      orderBy: { createdAt: "asc" },
      take: 50
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const { content, isTemplate, emoji } = await req.json();

    const message = await prisma.roastMessage.create({
      data: {
        roomId: params.id,
        senderId: userId,
        senderName: session.user.name || "Performer",
        content,
        isTemplate: isTemplate || false,
        emoji
      }
    });

    // Update room's updatedAt for sorting
    await prisma.roastRoom.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    });

    // Notify other members of the room about the new roast
    const room = await prisma.roastRoom.findUnique({
      where: { id: params.id },
      include: { members: { select: { id: true } } }
    });

    if (room) {
      const otherMembers = room.members.filter(m => m.id !== userId);
      await Promise.all(otherMembers.map(m => 
        prisma.notification.create({
          data: {
            userId: m.id,
            title: "Incoming Burn! 🔥",
            message: `${session.user?.name} just roasted you in the arena: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            type: "ROAST",
            link: `/tools/roast-buddy`
          }
        })
      ));
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
