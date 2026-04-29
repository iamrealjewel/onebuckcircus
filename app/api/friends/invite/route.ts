import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendFriendInvitationEmail, sendAccessRoastEmail } from "@/lib/mail";
import { generateFriendRoast } from "@/app/actions/acts";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { email, actId } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const inviterId = (session.user as any).id;

    // Check if user is trying to invite themselves
    if (email.toLowerCase() === session.user.email?.toLowerCase()) {
      return new NextResponse("You cannot invite yourself to the circus.", { status: 400 });
    }

    // 1. Check if the target email is already a registered User
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      include: { subscription: true }
    });

    if (existingUser) {
      // Logic for existing users
      
      // If actId is provided, check if the user has access
      if (actId) {
        const config = await prisma.subscriptionActConfig.findUnique({
          where: {
            subscriptionId_actId: {
              subscriptionId: existingUser.subscriptionId || "",
              actId: actId
            }
          }
        });

        const hasAccess = config?.isAvailable && (config?.isFree || (config?.freeUntil && new Date(config.freeUntil) > new Date()));

        if (hasAccess) {
          // Create a duel session
          let duelId = "";
          if (actId === "tic-tac-toe") {
            const duel = await prisma.ticTacToeDuel.create({
              data: {
                player1Id: inviterId,
                player2Id: existingUser.id,
                turnId: inviterId,
                status: "PENDING"
              }
            });
            duelId = duel.id;
          }

          // Send internal notification for the match
          await prisma.notification.create({
            data: {
              userId: existingUser.id,
              title: "Arena Challenge! 🎪⚔️",
              message: `${session.user.name} is challenging you to a duel in ${actId === 'tic-tac-toe' ? "Oracle's Gambit" : "the Arena"}. Enter if you dare.`,
              type: "INVITE",
              link: `/tools/${actId}?duelId=${duelId}`
            }
          });
          return NextResponse.json({ message: "Victim notified! They shall arrive in the arena shortly.", type: "internal", duelId });
        } else {
          // No access? Send a roast email to upgrade
          const roast = await generateFriendRoast(session.user.name || "A mysterious performer", email);
          const act = await prisma.act.findUnique({ where: { id: actId } });
          
          await sendAccessRoastEmail(email, session.user.name || "A mysterious performer", act?.name || "The Games", roast);
          
          return NextResponse.json({ 
            message: "This performer is too poor for your game. The Oracle has sent a roast demanding they upgrade.", 
            type: "roast_sent" 
          });
        }
      }

      // Fallback: Standard friendship request if no actId or after check
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: inviterId, friendId: existingUser.id },
            { userId: existingUser.id, friendId: inviterId }
          ]
        }
      });

      if (!existingFriendship) {
        const roast = await generateFriendRoast(session.user.name || "A mysterious performer", email);
        await prisma.friendship.create({
          data: {
            userId: inviterId,
            friendId: existingUser.id,
            status: "PENDING",
            message: roast
          }
        });
      } else if (existingFriendship.status === "PENDING" && existingFriendship.friendId === inviterId) {
        // Auto-accept if the other person already invited them
        await prisma.friendship.update({
          where: { id: existingFriendship.id },
          data: { status: "ACCEPTED" }
        });
        return NextResponse.json({ message: "You are now friends! The Oracle approves.", type: "internal" });
      }

      return NextResponse.json({ message: "Friend request sent to existing user!", type: "internal" });
    } else {
      // 2. The target email is NOT a user, so we send an email invitation to signup
      const token = uuidv4();
      const roast = await generateFriendRoast(session.user.name || "A mysterious performer", email);

      // Manual find and update/create because email is not unique in the schema
      const existingInvite = await prisma.emailInvitation.findFirst({
        where: { email, inviterId, status: "PENDING" }
      });

      if (existingInvite) {
        await prisma.emailInvitation.update({
          where: { id: existingInvite.id },
          data: { token, message: roast }
        });
      } else {
        await prisma.emailInvitation.create({
          data: {
            email,
            inviterId,
            token,
            message: roast
          }
        });
      }

      // Send the recruitment email
      const emailResult = await sendFriendInvitationEmail(email, session.user.name || "A mysterious performer", token);

      if (!emailResult.success) {
        return new NextResponse(`The Oracle's pigeon died: ${emailResult.error?.message || "Unknown error"}`, { status: 500 });
      }

      return NextResponse.json({ message: "Recruitment scroll dispatched! A new victim has been summoned.", type: "email" });
    }
  } catch (error: any) {
    console.error(error);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
