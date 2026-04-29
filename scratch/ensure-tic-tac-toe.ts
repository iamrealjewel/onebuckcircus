import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.act.upsert({
    where: { id: "tic-tac-toe" },
    update: {},
    create: {
      id: "tic-tac-toe",
      name: "Tic-Tac-Toe",
      emoji: "❌",
      description: "Play a chaotic game of Tic-Tac-Toe against the Oracle. Warning: It might cheat or cry.",
      aiModelId: "default-model"
    }
  });
  console.log("Tic-Tac-Toe act ensured in database.");
}

main();
