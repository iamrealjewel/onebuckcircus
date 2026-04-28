import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token, identifier: { startsWith: "confirm-new-email:" } }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return new NextResponse("Invalid or expired token. The circus moved on.", { status: 400 });
    }

    // identifier format: confirm-new-email:userId:newEmailAddress
    const parts = verificationToken.identifier.split(":");
    const userId = parts[1];
    const newEmail = parts.slice(2).join(":"); // in case email has colons, though unlikely

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail }
    });

    // Delete all pending email-related tokens to fully unlock the account
    await prisma.verificationToken.deleteMany({
      where: { 
        OR: [
          { identifier: { startsWith: `email-change:${userId}` } },
          { identifier: { startsWith: `confirm-new-email:${userId}:` } }
        ]
      }
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error(error);
    return new NextResponse("Server error", { status: 500 });
  }
}
