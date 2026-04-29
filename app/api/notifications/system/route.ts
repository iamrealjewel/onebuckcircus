import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { title, message, type, link } = await req.json();

    const notification = await prisma.notification.create({
      data: {
        userId,
        title: title || "System Alert",
        message,
        type: type || "SYSTEM",
        link
      }
    });

    return NextResponse.json({ notification });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
