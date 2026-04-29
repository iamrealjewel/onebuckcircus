import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    await prisma.notification.delete({
      where: { id: params.id, userId: (session.user as any).id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
