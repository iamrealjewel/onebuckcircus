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
    const now = new Date();
    const endDate = new Date();
    if (billingCycle === "yearly") {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        subscriptionId: subscription.id,
        subscribedAt: now,
        subscriptionEnd: endDate,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
