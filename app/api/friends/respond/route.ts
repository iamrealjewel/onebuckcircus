import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { friendshipId, action } = await req.json(); // action: "ACCEPT" or "REJECT"

    if (!friendshipId || !["ACCEPT", "REJECT"].includes(action)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const userId = (session.user as any).id;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      return new NextResponse("Friend request not found", { status: 404 });
    }

    // Ensure the current user is the recipient of the friend request
    if (friendship.friendId !== userId) {
      return new NextResponse("You cannot respond to this request", { status: 403 });
    }

    if (action === "ACCEPT") {
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: "ACCEPTED" }
      });
      return NextResponse.json({ message: "Friend request accepted!" });
    } else {
      await prisma.friendship.delete({
        where: { id: friendshipId }
      });
      return NextResponse.json({ message: "Friend request rejected." });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
