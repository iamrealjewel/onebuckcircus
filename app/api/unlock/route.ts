import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, emailVerified: true } });
    const tokens = await prisma.verificationToken.findMany();
    return NextResponse.json({ users, tokens });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
