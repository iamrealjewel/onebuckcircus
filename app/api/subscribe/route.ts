import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tier, billingCycle } = await req.json();

  // Find the subscription template from the DB
  const subscription = await prisma.subscription.findFirst({
    where: { tier }
  });

  if (!subscription) {
    return new NextResponse("Invalid tier", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { subscription: true }
    });

    const getTierLevel = (t: string) => {
      if (t === "CHAOS") return 1;
      if (t === "DESTRUCTION") return 2;
      if (t === "ANNIHILATION") return 3;
      return 0;
    };

    const currentLevel = user?.subscription ? getTierLevel(user.subscription.tier) : 0;
    const newLevel = getTierLevel(tier);
    const isUpgrade = newLevel > currentLevel;

    const dataToUpdate: any = {
      subscriptionId: subscription.id,
    };

    if (!isUpgrade || !user?.subscriptionEnd) {
      const now = new Date();
      const endDate = new Date();
      if (billingCycle === "yearly") {
        endDate.setFullYear(now.getFullYear() + 1);
      } else {
        endDate.setMonth(now.getMonth() + 1);
      }
      dataToUpdate.subscribedAt = now;
      dataToUpdate.subscriptionEnd = endDate;
    }

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
