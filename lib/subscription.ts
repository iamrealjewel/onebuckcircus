import { prisma } from "./prisma";

export type SubscriptionTier = "NONE" | "CHAOS" | "DESTRUCTION" | "ANNIHILATION";

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      selectedApps: true,
    },
  });

  return {
    tier: (user?.subscription?.tier as SubscriptionTier) || "NONE",
    selectedApps: user?.selectedApps.map(s => s.actId) || [],
  };
}

export function hasAccessToApp(
  subscription: { tier: SubscriptionTier; selectedApps: string[] },
  appId: string
) {
  if (subscription.tier === "ANNIHILATION") return true;
  if (subscription.tier === "CHAOS" || subscription.tier === "DESTRUCTION") {
    return subscription.selectedApps.includes(appId);
  }
  return false;
}
