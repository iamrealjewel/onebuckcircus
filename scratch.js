const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = await prisma.aIModel.findMany();
  console.log("AI Models:", models);
}

main().finally(() => prisma.$disconnect());
