import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const acts = await prisma.act.findMany();
  console.log(JSON.stringify(acts, null, 2));
}

main();
