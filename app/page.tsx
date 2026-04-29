import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowRight, Star, Dices, Zap, Crown, Flame, ShieldAlert, Sparkles, Swords } from "lucide-react";
import DashboardClient from "./DashboardClient";
import LandingClient from "./LandingClient";

const tools = [
  {
    id: "roast-buddy",
    emoji: "🤝",
    name: "RoastBuddy",
    tagline: "The Arena of Insults",
    desc: "A social arena where friends roast each other live. Free for all performers.",
    color: "var(--brand-accent)",
    isSystem: true,
    examples: ["Live friend roasting", "AI insult templates", "Group RoastRooms"],
  },
  {
    id: "settle-it",
    emoji: "⚖️",
    name: "Settle It",
    tagline: "Argument Court",
    desc: "Submit any dispute. Get an official court-style verdict. Share it. Win.",
    color: "var(--brand-primary)",
    examples: ["Pineapple on pizza?", "Who texts first?", "Was it your fault?"],
  },
  {
    id: "life-as-movie",
    emoji: "🎬",
    name: "Life as a Movie",
    tagline: "Hollywood Pitch Generator",
    desc: "Answer 6 questions. Get your life turned into a full Hollywood movie pitch.",
    color: "var(--brand-accent)",
    examples: ["Title, genre & tagline", "Celebrity cast", "3-act plot + trailer"],
  },
  {
    id: "roast-my-idea",
    emoji: "🔥",
    name: "Roast My Idea",
    tagline: "Brutal Honest Feedback",
    desc: "Submit your idea. Get roasted. Get 5 real improvements. Cry. Build anyway.",
    color: "var(--brand-secondary)",
    examples: ["Startup ideas", "Side projects", "Business concepts"],
  },
  {
    id: "name-it",
    emoji: "✨",
    name: "Name It",
    tagline: "The Naming Oracle",
    desc: "Name your baby, pet, band, startup, or boat. Get 10 curated names with stories.",
    color: "var(--brand-secondary)",
    examples: ["Babies & pets", "Startups & brands", "Bands & projects"],
  },
  {
    id: "breakup-receipt",
    emoji: "🧾",
    name: "Breakup Receipt",
    tagline: "Emotional Closure Machine",
    desc: "Itemize the emotional cost of any relationship. Get your official receipt. Heal.",
    color: "var(--brand-primary)",
    examples: ["Romantic breakups", "Toxic friendships", "Bad jobs"],
  },
  {
    id: "tic-tac-toe",
    emoji: "❌",
    name: "Tic-Tac-Toe",
    tagline: "The Oracle's Gambit",
    desc: "Play a chaotic game of Tic-Tac-Toe against the Oracle. Warning: It might cheat or cry.",
    color: "var(--brand-primary)",
    examples: ["AI trash talk", "Cheating Oracle", "Eternal blunders"],
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <LandingClient tools={tools} />;
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return <LandingClient tools={tools} />;
  }
  
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const selections = await prisma.userActSelection.findMany({
    where: { userId }
  });

  const subscription = user.subscriptionId 
    ? await prisma.subscription.findUnique({ where: { id: user.subscriptionId } })
    : null;

  const allConfigs: any[] = await prisma.$queryRaw`
    SELECT * FROM SubscriptionActConfig 
    WHERE subscriptionId = ${user.subscriptionId || ""}
  `;

  const acts = await prisma.act.findMany();

  const availableActs = acts.filter(act => {
    const config = allConfigs.find(c => c.actId === act.id);
    return config ? config.isAvailable : true;
  }).map(act => {
    const config = allConfigs.find(c => c.actId === act.id);
    const isFreeByConfig = config?.isFree || (config?.freeUntil && new Date(config.freeUntil) > new Date());
    
    return {
      ...act,
      tagline: "Active Attraction",
      color: "var(--brand-primary)",
      isFree: isFreeByConfig
    };
  });

  return (
    <DashboardClient 
      user={JSON.parse(JSON.stringify(user))} 
      subscription={subscription ? JSON.parse(JSON.stringify(subscription)) : null} 
      selectedActs={selections.map(s => s.actId)} 
      availableActs={JSON.parse(JSON.stringify(availableActs))} 
    />
  );
}
