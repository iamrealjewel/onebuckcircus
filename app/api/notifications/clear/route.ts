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
    // Physically delete all notifications for the user to ensure they NEVER reappear
    await prisma.notification.deleteMany({
      where: { userId }
    });

    return NextResponse.json({ success: true, message: "Ledger Purged" });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
