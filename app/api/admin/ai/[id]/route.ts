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
    if (data.isGlobalDefault) {
      // Use transaction to reset others and set this one
      const [updated] = await prisma.$transaction([
        prisma.aIModel.update({
          where: { id },
          data
        }),
        prisma.aIModel.updateMany({
          where: { NOT: { id } },
          data: { isGlobalDefault: false }
        })
      ]);
      return NextResponse.json(updated);
    }

    const model = await prisma.aIModel.update({
      where: { id },
      data
    });
    return NextResponse.json(model);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error updating AI model", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  try {
    await prisma.aIModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting AI model", { status: 500 });
  }
}
