import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const rooms = await prisma.roastRoom.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        members: {
          include: { user: { select: { name: true, image: true } } }
        },
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;

  try {
    const { memberIds, name } = await req.json();

    const room = await prisma.roastRoom.create({
      data: {
        name: name || "New Roast Arena",
        members: {
          create: [
            { userId, role: "Ringmaster", avatar: "👑" },
            ...memberIds.map((id: string) => ({ userId: id, role: "Performer", avatar: "🤡" }))
          ]
        }
      },
      include: {
        members: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    // Notify members
    await Promise.all(memberIds.map((mid: string) => 
      prisma.notification.create({
        data: {
          userId: mid,
          title: "New Roast Challenge!",
          message: `${session.user?.name} has summoned you to a Roast Arena. Prepare for annihilation.`,
          type: "INVITE",
          link: `/tools/roast-buddy`
        }
      })
    ));

    return NextResponse.json({ room });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
