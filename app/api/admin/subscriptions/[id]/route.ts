import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const data = await req.json();
  try {
    const sub = await prisma.subscription.update({
      where: { id },
      data
    });
    return NextResponse.json(sub);
  } catch (error) {
    return new NextResponse("Error updating subscription", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  try {
    await prisma.subscription.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting subscription", { status: 500 });
  }
}
