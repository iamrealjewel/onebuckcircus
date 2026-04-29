
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetModel = 'llama-3.3-70b-versatile';
  
  console.log(`Updating all models to: ${targetModel}`);
  
  const result = await prisma.aIModel.updateMany({
    data: { modelName: targetModel }
  });
  
  console.log(`Updated ${result.count} models.`);
  console.log('--- PATCH COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
