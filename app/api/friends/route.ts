import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // 1. Get all accepted friends
    const acceptedFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: "ACCEPTED" },
          { friendId: userId, status: "ACCEPTED" }
        ]
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            image: true, 
            points: true,
            wins: true,
            losses: true,
            subscription: { select: { name: true, tier: true } }
          } 
        },
        friend: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            image: true, 
            points: true,
            wins: true,
            losses: true,
            subscription: { select: { name: true, tier: true } }
          } 
        }
      }
    });

    const friendIds = acceptedFriendships.map(f => f.userId === userId ? f.friendId : f.userId);
    
    // Fetch selections independently
    const allSelections = await prisma.userActSelection.findMany({
      where: { userId: { in: friendIds } }
    });

    const friends = acceptedFriendships.map(f => {
      const otherUser = f.userId === userId ? f.friend : f.user;
      const userSelections = allSelections.filter(s => s.userId === otherUser.id);
      return {
        ...otherUser,
        hasAccessTo: userSelections.map(a => a.actId)
      };
    });

    // 2. Pending Requests Received
    const pendingReceived = await prisma.friendship.findMany({
      where: { friendId: userId, status: "PENDING" },
      select: { 
        id: true, 
        message: true, 
        user: { select: { id: true, name: true, email: true, image: true } } 
      }
    });

    // 3. Pending Requests Sent (Internal)
    const pendingSent = await prisma.friendship.findMany({
      where: { userId, status: "PENDING" },
      select: { 
        id: true, 
        message: true, 
        friend: { select: { id: true, name: true, email: true, image: true } } 
      }
    });

    // 4. Pending Email Invitations
    const emailInvitations = await prisma.emailInvitation.findMany({
      where: { inviterId: userId, status: "PENDING" },
      select: { id: true, email: true, createdAt: true, message: true }
    });

    // 5. Get User's Referral Stats
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        _count: {
          select: { friendshipsInitiated: { where: { status: "ACCEPTED" } } } // This tracks successful referrals
        }
      }
    });

    return NextResponse.json({
      friends,
      pendingReceived,
      pendingSent,
      emailInvitations,
      referralCode: userStats?.referralCode,
      referralsCount: userStats?._count.friendshipsInitiated || 0
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
