import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    // 1. Find token
    const vToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!vToken || new Date() > vToken.expires) {
      return new NextResponse("Token invalid or expired.", { status: 400 });
    }

    // 2. Verify User
    await prisma.user.update({
      where: { email: vToken.identifier },
      data: { emailVerified: new Date() }
    });

    // 3. Cleanup token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse("Error verifying: " + error.message, { status: 500 });
  }
}
