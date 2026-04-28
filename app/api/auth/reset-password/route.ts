import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword || newPassword.length < 6) {
      return new NextResponse("Valid token and a 6+ character password are required", { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token, identifier: { startsWith: "password-reset:" } }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    const userId = verificationToken.identifier.split(":")[1];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: verificationToken.identifier, token } }
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error(error);
    return new NextResponse("Server error", { status: 500 });
  }
}
