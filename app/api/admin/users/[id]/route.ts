import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const { name } = await req.json();

  try {
    const data: any = { name };

    const user = await prisma.user.update({
      where: { id },
      data
    });
    
    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "UPDATED_USER",
      `Changed name to ${name}`,
      id,
      user.email
    );
    
    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Error updating user", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await prisma.user.delete({ where: { id } });
    
    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "DELETED_USER",
      `Banished user from the circus.`,
      id,
      user.email
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting user", { status: 500 });
  }
}
