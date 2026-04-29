
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const models = await prisma.aIModel.findMany();
  console.log('--- CURRENT AI MODELS ---');
  console.log(JSON.stringify(models, null, 2));

  // Logic to correct common misspellings/mismatches
  for (const m of models) {
    let updatedName = m.modelName;
    
    // Groq Llama 3 corrections
    if (m.modelName === 'llama-3-70b') updatedName = 'llama3-70b-8192';
    if (m.modelName === 'llama-3-8b') updatedName = 'llama3-8b-8192';
    
    if (updatedName !== m.modelName) {
      console.log(`Updating ${m.name}: ${m.modelName} -> ${updatedName}`);
      await prisma.aIModel.update({
        where: { id: m.id },
        data: { modelName: updatedName }
      });
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
