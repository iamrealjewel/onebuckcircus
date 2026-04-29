const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Initial Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "iamrealjewel@gmail.com" },
    update: {},
    create: {
      email: "iamrealjewel@gmail.com",
      name: "iamrealjewel",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Subscription Tiers
  const subscriptions = [
    {
      name: "Chaos",
      tier: "CHAOS",
      priceMonthly: 1.0,
      priceYearly: 10.0,
      maxActs: 3,
      features: JSON.stringify(["Unlimited use of 3 selected acts", "Free RoastBuddy Access", "Basic support", "Standard AI response"]),
    },
    {
      name: "Destruction",
      tier: "DESTRUCTION",
      priceMonthly: 2.0,
      priceYearly: 20.0,
      maxActs: 5,
      features: JSON.stringify(["Unlimited use of 5 selected acts", "Free RoastBuddy Access", "Priority support", "Faster AI response"]),
    },
    {
      name: "Annihilation",
      tier: "ANNIHILATION",
      priceMonthly: 5.0,
      priceYearly: 50.0,
      maxActs: -1,
      features: JSON.stringify(["All acts unlocked", "Free RoastBuddy Access", "VIP support", "Premium AI models", "Early access to new acts"]),
    },
  ];

  for (const sub of subscriptions) {
    await prisma.subscription.upsert({
      where: { id: sub.tier }, // Using tier as ID for simplicity in seeding if needed, or just finding by name
      update: sub,
      create: { ...sub, id: sub.tier },
    });
  }
  console.log("Subscriptions seeded.");

  // 3. AI Models
  const aiModel = await prisma.aIModel.upsert({
    where: { id: "default-model" },
    update: {},
    create: {
      id: "default-model",
      name: "Circus Oracle",
      modelName: "llama-3-70b",
      apiKey: "FREE_MOCK_KEY",
      apiUrl: "https://api.groq.com/openai/v1",
      isActive: true,
      isGlobalDefault: true,
    },
  });
  console.log("Default AI Model seeded.");

  // 4. Initial Acts
  const acts = [
    { id: "settle-it", name: "Settle It", emoji: "⚖️", description: "Official court-style verdicts for petty disputes." },
    { id: "life-as-movie", name: "Life as a Movie", emoji: "🎬", description: "Your life story pitched by Hollywood's finest." },
    { id: "roast-my-idea", name: "Roast My Idea", emoji: "🔥", description: "Brutal honesty for your billion-dollar dreams." },
    { id: "name-it", name: "Name It", emoji: "✨", description: "The Oracle finds the perfect name for anything." },
    { id: "breakup-receipt", name: "Breakup Receipt", emoji: "🧾", description: "Official closure for emotional investments." },
  ];

  for (const act of acts) {
    await prisma.act.upsert({
      where: { id: act.id },
      update: act,
      create: { ...act, aiModelId: aiModel.id },
    });
  }
  console.log("Acts seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
