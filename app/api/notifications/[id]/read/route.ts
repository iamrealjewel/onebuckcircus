import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    await prisma.notification.update({
      where: { id: id, userId: (session.user as any).id },
      data: { isRead: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
