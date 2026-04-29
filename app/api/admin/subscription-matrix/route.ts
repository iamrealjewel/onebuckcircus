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
    // RAW SQL BYPASS: Use queryRaw because the Prisma Client is out of sync
    const matrix = await prisma.$queryRaw`SELECT * FROM SubscriptionActConfig`;
    return NextResponse.json(matrix);
  } catch (error: any) {
    console.error("[Subscription Matrix GET Failure]:", error.message);
    return NextResponse.json([]);
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { subscriptionId, actId, isAvailable, isFree, freeUntil } = await req.json();

    const id = `sc_${subscriptionId}_${actId}`;
    const available = isAvailable ?? true;
    const free = isFree ?? false;
    const dateLimit = freeUntil ? new Date(freeUntil).toISOString().slice(0, 19).replace('T', ' ') : null;

    // RAW SQL BYPASS: Manual Upsert using MySQL syntax
    await prisma.$executeRaw`
      INSERT INTO SubscriptionActConfig (id, subscriptionId, actId, isAvailable, isFree, freeUntil)
      VALUES (${id}, ${subscriptionId}, ${actId}, ${available}, ${free}, ${dateLimit})
      ON DUPLICATE KEY UPDATE
        isAvailable = VALUES(isAvailable),
        isFree = VALUES(isFree),
        freeUntil = VALUES(freeUntil)
    `;

    // AUDIT LOG: Record the administrative action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        adminName: session.user.name || "Unknown Admin",
        action: "UPDATE_MATRIX_CONFIG",
        details: `Updated matrix for Sub: ${subscriptionId}, Act: ${actId}. Free: ${free}, Until: ${dateLimit || 'Forever'}`,
        targetId: id,
        targetName: `Matrix: ${subscriptionId}/${actId}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Subscription Matrix PATCH Failure]:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
