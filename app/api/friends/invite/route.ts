import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendFriendInvitationEmail } from "@/lib/mail";
import { generateFriendRoast } from "@/app/actions/acts";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const inviterId = (session.user as any).id;

    // Check if user is trying to invite themselves
    if (email.toLowerCase() === session.user.email?.toLowerCase()) {
      return new NextResponse("You cannot invite yourself to the circus.", { status: 400 });
    }

    // 1. Check if the target email is already a registered User
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Create an internal friend request (Friendship PENDING)
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: inviterId, friendId: existingUser.id },
            { userId: existingUser.id, friendId: inviterId }
          ]
        }
      });

      if (existingFriendship) {
        return new NextResponse("You are already friends or have a pending request.", { status: 400 });
      }

      const roast = await generateFriendRoast(session.user.name || "A mysterious performer", email);

      await prisma.friendship.create({
        data: {
          userId: inviterId,
          friendId: existingUser.id,
          status: "PENDING",
          message: roast
        }
      });

      return NextResponse.json({ message: "Friend request sent to existing user!", type: "internal" });
    } else {
      // 2. The target email is NOT a user, so we send an email invitation
      
      // Check if already invited
      const existingInvite = await prisma.emailInvitation.findFirst({
        where: { email, inviterId, status: "PENDING" }
      });

      if (existingInvite) {
        return new NextResponse("You already sent an invitation to this email.", { status: 400 });
      }

      const token = uuidv4();

      const roast = await generateFriendRoast(session.user.name || "A mysterious performer", email);

      await prisma.emailInvitation.create({
        data: {
          email,
          inviterId,
          token,
          message: roast
        }
      });

      // Send the email
      const emailResult = await sendFriendInvitationEmail(email, session.user.name || "A mysterious performer", token);

      if (!emailResult.success) {
        return new NextResponse(`The Oracle's pigeon died: ${emailResult.error?.message || "Unknown error"}`, { status: 500 });
      }

      return NextResponse.json({ message: "Email invitation sent! The Oracle has dispatched the scroll.", type: "email" });
    }
  } catch (error: any) {
    console.error(error);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
