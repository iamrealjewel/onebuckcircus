import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const acts = await prisma.act.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json(acts);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id, isSystem } = await req.json();

    const act = await prisma.act.update({
      where: { id },
      data: { isSystem }
    });

    return NextResponse.json(act);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
