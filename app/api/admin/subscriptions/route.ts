import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const data = await req.json();
  try {
    const sub = await prisma.subscription.create({ data });
    
    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "CREATED_SUBSCRIPTION",
      `Created ticket tier: ${sub.name}`,
      sub.id,
      sub.name
    );
    
    return NextResponse.json(sub);
  } catch (error) {
    return new NextResponse("Error creating subscription", { status: 500 });
  }
}
