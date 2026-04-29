
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const actId = 'tic-tac-toe';
  
  // 1. Ensure Act exists
  await prisma.act.upsert({
    where: { id: actId },
    update: { isActive: true, isSystem: true },
    create: {
      id: actId,
      name: 'Tic-Tac-Toe',
      emoji: '❌',
      description: "The Oracle's Gambit. A chaotic game against the AI.",
      isActive: true,
      isSystem: true
    }
  });

  // 2. Get all subscriptions
  const subs = await prisma.subscription.findMany();
  
  // 3. Make it free for everyone in the matrix
  for (const sub of subs) {
    const matrixId = `sc_${sub.id}_${actId}`;
    await prisma.$executeRaw`
      INSERT INTO SubscriptionActConfig (id, subscriptionId, actId, isAvailable, isFree, freeUntil)
      VALUES (${matrixId}, ${sub.id}, ${actId}, true, true, null)
      ON DUPLICATE KEY UPDATE isFree = true, isAvailable = true, freeUntil = null
    `;
    console.log(`Granted free access to ${actId} for tier: ${sub.name}`);
  }

  console.log('--- TIC-TAC-TOE DEPLOYED ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
