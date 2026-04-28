import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendNewEmailConfirmation } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { token, newEmail } = await req.json();

    if (!token || !newEmail) {
      return new NextResponse("Token and new email are required", { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token, identifier: { startsWith: "email-change:" } }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    const userId = verificationToken.identifier.split(":")[1];

    // Check if new email is taken
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return new NextResponse("Email already in use", { status: 400 });
    }

    // Instead of updating immediately, create a new confirmation token
    const newToken = uuidv4();
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save the new email in the identifier so we know what to update it to
    await prisma.verificationToken.create({
      data: {
        identifier: `confirm-new-email:${userId}:${newEmail}`,
        token: newToken,
        expires: newExpires
      }
    });

    // Delete ALL old "email-change" tokens since it was successfully consumed
    // This prevents stale tokens from keeping the account locked
    await prisma.verificationToken.deleteMany({
      where: { identifier: { startsWith: `email-change:${userId}` } }
    });

    // Send the confirmation email to the NEW email address
    await sendNewEmailConfirmation(newEmail, newToken);

    return NextResponse.json({ success: true, message: "Confirmation sent to new email." });
  } catch (error) {
    console.error(error);
    return new NextResponse("Server error", { status: 500 });
  }
}
