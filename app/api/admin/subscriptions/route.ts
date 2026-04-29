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
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { priceMonthly: "asc" }
    });
    return NextResponse.json(subscriptions);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();
    const subscription = await prisma.subscription.create({
      data: {
        name: data.name,
        tier: data.tier,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly || data.priceMonthly * 10,
        maxActs: data.maxActs,
        features: data.features
      }
    });
    return NextResponse.json(subscription);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        name: updateData.name,
        tier: updateData.tier,
        priceMonthly: updateData.priceMonthly,
        priceYearly: updateData.priceYearly || updateData.priceMonthly * 10,
        maxActs: updateData.maxActs,
        features: updateData.features
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id, maxActs } = await req.json();

    const subscription = await prisma.subscription.update({
      where: { id },
      data: { maxActs }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
