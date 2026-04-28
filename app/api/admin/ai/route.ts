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
    const model = await prisma.aIModel.create({ data });
    
    await logAdminAction(
      (session.user as any).id,
      session.user.name as string,
      "CREATED_AI_MODEL",
      `Manifested a new Oracle: ${model.name}`,
      model.id,
      model.name
    );
    
    return NextResponse.json(model);
  } catch (error) {
    return new NextResponse("Error creating AI model", { status: 500 });
  }
}
