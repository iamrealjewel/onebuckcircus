import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { selectedIds } = await req.json();
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true, selectedApps: true }
  });

  if (!user || !user.subscription) {
    return new NextResponse("Subscription required", { status: 400 });
  }

  if (user.subscription.tier === "ANNIHILATION") {
    return new NextResponse("Annihilation users have access to all acts automatically", { status: 400 });
  }

  if (selectedIds.length > user.subscription.maxActs) {
    return new NextResponse("Exceeded act limit for your tier", { status: 400 });
  }

  // Check if they already have selections and if they are locked
  const now = new Date();
  const existingSelection = user.selectedApps[0];
  if (existingSelection && existingSelection.canChangeAfter > now) {
    return new NextResponse("Selection is currently locked. Check back later.", { status: 403 });
  }

  try {
    // Delete old selections and add new ones
    await prisma.$transaction([
      prisma.userActSelection.deleteMany({
        where: { userId }
      }),
      prisma.userActSelection.createMany({
        data: selectedIds.map((actId: string) => ({
          userId,
          actId,
          canChangeAfter: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Act selection error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
