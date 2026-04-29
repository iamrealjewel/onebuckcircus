import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.act.upsert({
    where: { id: "roast-buddy" },
    update: { isSystem: true },
    create: {
      id: "roast-buddy",
      name: "RoastBuddy",
      emoji: "🤝",
      description: "The ultimate arena for mutual annihilation. Roast your friends live, use AI templates, and settle scores in real-time.",
      isActive: true,
      isSystem: true,
      aiModelId: "default-model"
    }
  });
  console.log("RoastBuddy system act registered.");
}

main();
