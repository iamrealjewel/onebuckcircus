import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendEmailChangeRequest } from "@/lib/mail";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if ((session?.user as any)?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: `email-change:${user.id}`,
        token,
        expires
      }
    });

    await sendEmailChangeRequest(user.email, token);

    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "REQUEST_EMAIL_CHANGE",
      `Sent email change link to ${user.email}`,
      user.id,
      user.email
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}
