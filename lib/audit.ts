import { prisma } from "./prisma";

export async function logAdminAction(
  adminId: string,
  adminName: string,
  action: string,
  details: string,
  targetId?: string,
  targetName?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        adminName: adminName || "Unknown Admin",
        action,
        details,
        targetId,
        targetName
      }
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
