import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";

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
    
    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "UPDATED_SUBSCRIPTION",
      `Updated ticket tier: ${sub.name}`,
      sub.id,
      sub.name
    );
    
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
    const sub = await prisma.subscription.delete({ where: { id } });
    
    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "DELETED_SUBSCRIPTION",
      `Removed ticket tier: ${sub.name}`,
      id,
      sub.name
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting subscription", { status: 500 });
  }
}
