import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, Star, Dices, Zap, Crown, Flame, ShieldAlert, Sparkles } from "lucide-react";

const tools = [
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
    return <LandingPage />;
  }

  const user = session.user as any;
  
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const subType = user?.subscriptionType || "NONE";
  const selectedActs = user?.selectedApps || [];

  return <DashboardPage user={user} subType={subType} selectedActs={selectedActs} />;
}

// ==========================================
// 🎪 PERSONALIZED DASHBOARD (LOGGED IN)
// ==========================================
function DashboardPage({ user, subType, selectedActs }: { user: any, subType: string, selectedActs: string[] }) {
  const isAnnihilation = subType === "ANNIHILATION";
  
  // Show all acts, but track which are locked
  const allActs = tools;

  // Determine Dashboard Theme
  let themeColor = "var(--brand-primary)";
  let badgeIcon = <Sparkles size={16} />;
  let welcomeMessage = "Welcome to the Big Top";

  if (subType === "CHAOS") {
    themeColor = "#a3e635"; // Lime
    badgeIcon = <Dices size={16} />;
    welcomeMessage = "Embrace the Chaos";
  } else if (subType === "DESTRUCTION") {
    themeColor = "#f43f5e"; // Rose
    badgeIcon = <Zap size={16} />;
    welcomeMessage = "Unleash Destruction";
  } else if (subType === "ANNIHILATION") {
    themeColor = "#facc15"; // Gold
    badgeIcon = <Crown size={16} />;
    welcomeMessage = "Absolute Power";
  }

  // Calculate days left
  const subscriptionEnd = user?.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
  const daysLeft = subscriptionEnd ? Math.ceil((subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  return (
    <main className="min-h-screen flex flex-col items-center pb-24">
      <Navbar />

      <section className="w-full relative pt-32 pb-12 px-6 lg:px-12 flex flex-col items-center">
        <div className="w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
            <div>
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4 uppercase tracking-widest shadow-lg"
                style={{ backgroundColor: `${themeColor}20`, color: themeColor, borderColor: `${themeColor}40`, borderWidth: '1px' }}
              >
                {badgeIcon} {subType !== "NONE" ? `${subType} PASS ACTIVE (${daysLeft} DAYS LEFT)` : "NO PASS ACTIVE"}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                {welcomeMessage}, <span style={{ color: themeColor }}>{user.name?.split(' ')[0]}</span>.
              </h1>
            </div>
            
            {subType === "NONE" && (
              <Link href="/circus-pass" className="btn-primary py-4 px-8 text-sm">
                Get Your Pass <ArrowRight size={16} className="ml-2 inline" />
              </Link>
            )}
            
            {subType !== "NONE" && subType !== "ANNIHILATION" && (
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Acts Locked In</div>
                <div className="text-3xl font-black">{selectedActs.length} <span className="text-[var(--text-muted)] text-lg">/ {user.maxActs}</span></div>
              </div>
            )}
          </div>

          {/* Expiring Soon Warning */}
          {subType !== "NONE" && isExpiringSoon && (
            <div className="w-full p-6 rounded-3xl border border-red-500/50 bg-red-500/10 mb-8 flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
              <div className="flex items-center gap-4">
                <ShieldAlert className="text-red-500" size={32} />
                <div>
                  <h3 className="text-xl font-black text-red-500 uppercase tracking-widest mb-1">The End is Near...</h3>
                  <p className="text-red-400 font-medium">Your Circus Pact expires in just {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Renew now to keep the chaos flowing.</p>
                </div>
              </div>
              <Link href="/circus-pass" className="btn-primary !bg-red-500 !border-red-500 !text-white hover:!bg-red-600 whitespace-nowrap hidden md:block">
                Renew Pact
              </Link>
            </div>
          )}

          {/* Action Required: Select Acts */}
          {subType !== "NONE" && !isAnnihilation && selectedActs.length < user.maxActs && (
            <div className="w-full p-8 rounded-3xl border-2 border-orange-500/30 bg-orange-500/10 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-orange-400 mb-2">You have unselected acts!</h3>
                <p className="text-orange-400/80 font-medium">Your pass allows you to unlock {user.maxActs - selectedActs.length} more acts.</p>
              </div>
              <Link href="/select-acts" className="btn-primary bg-orange-500 text-white hover:bg-orange-600 border-orange-500 shadow-orange-500/20 px-8 py-4 whitespace-nowrap">
                Select Your Acts <ArrowRight size={16} className="ml-2 inline" />
              </Link>
            </div>
          )}

          {/* User's Acts Arsenal */}
          <div>
            <h2 className="text-2xl font-black mb-6 uppercase tracking-widest text-[var(--text-muted)]">The Grand Arsenal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allActs.map((tool) => {
                const isLocked = !isAnnihilation && !selectedActs.includes(tool.id);
                
                const roasts = [
                  "Your current pass is too pathetic for this much chaos.",
                  "Stage closed. Come back when you're less of a peasant.",
                  "Access denied. The Oracle doesn't speak to 'Free' users.",
                  "You want this? Pay up, you absolute joker.",
                  "Error 402: Your wallet is too thin for this act."
                ];
                const randomRoast = roasts[Math.abs(tool.id.length % roasts.length)];

                if (isLocked) {
                  return (
                    <div key={tool.id} className="card-glass h-full p-8 flex flex-col border-red-500/20 bg-red-500/5 opacity-80 group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-5xl grayscale group-hover:grayscale-0 transition-all duration-500">🔒</span>
                      </div>
                      <div className="text-[10px] font-black tracking-widest uppercase mb-2 text-red-500">STAGE CLOSED</div>
                      <h3 className="text-2xl font-black mb-3 text-[var(--text-muted)]">{tool.name}</h3>
                      <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow italic">
                        "{randomRoast}"
                      </p>
                      <Link href="/circus-pass" className="btn-primary !bg-red-500/20 !text-red-500 border border-red-500/30 hover:!bg-red-500 hover:!text-white py-3 text-xs uppercase tracking-widest transition-all">
                        Upgrade to Access
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link key={tool.id} href={`/tools/${tool.id}`} className="group h-full">
                    <div className="card-glass h-full p-8 flex flex-col border-[var(--border-color)] hover:border-white/20 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-5xl group-hover:scale-110 transition-transform">{tool.emoji}</span>
                      </div>
                      <div className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: tool.color }}>{tool.tagline}</div>
                      <h3 className="text-2xl font-black mb-3">{tool.name}</h3>
                      <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow">{tool.desc}</p>
                      <div className="font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: tool.color }}>
                        Launch Act <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ==========================================
// 🎪 PUBLIC LANDING PAGE (LOGGED OUT)
// ==========================================
function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Navbar />

      {/* HERO */}
      <section className="w-full relative pt-40 pb-24 px-6 overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--brand-primary)] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--brand-secondary)] rounded-full blur-[100px]" />
        </div>

        <div className="w-full text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black mb-8 border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--brand-accent)] uppercase tracking-widest">
            🎪 UNLIMITED CHAOS FOR A BUCK
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
            <span className="gradient-text">Unlimited</span>
            <br />
            <span className="text-[var(--text-main)]">Chaos.</span>
            <br />
            <span className="text-4xl md:text-5xl font-bold text-[var(--text-muted)]">Starting at $1/mo.</span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-2xl text-[var(--text-muted)] leading-relaxed">
            Stop overthinking life's messiest moments. Settle arguments, roast your ideas, or turn your life into a movie. Unlimited acts, zero friction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/auth" className="btn-primary text-xl px-12 py-5">
              🎪 Enter the Tent
            </Link>
            <Link href="#tools" className="btn-outline text-xl px-12 py-5">
              Browse Acts
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <section id="tools" className="w-full py-24 px-6 lg:px-12 bg-[var(--bg-surface)] flex flex-col items-center">
        <div className="w-full">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4">The Acts</h2>
            <p className="text-[var(--text-muted)] font-medium text-lg">Choose any 3 for $1/mo, or all of them for just $5/mo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <div key={tool.id} className="card-glass h-full p-8 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-5xl">{tool.emoji}</span>
                </div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: tool.color }}>{tool.tagline}</div>
                <h3 className="text-2xl font-black mb-3">{tool.name}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow">{tool.desc}</p>
                <div className="space-y-2 mb-8">
                  {tool.examples.map((ex) => (
                    <div key={ex} className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tool.color }} />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Pass Card */}
            <div className="card-glass p-8 bg-gradient-to-br from-[#facc15]/10 to-transparent border-[#facc15]/30 flex flex-col items-center text-center">
              <div className="text-5xl mb-6">👑</div>
              <div className="text-[10px] font-black tracking-widest uppercase mb-2 text-[#facc15]">ABSOLUTE POWER</div>
              <h3 className="text-2xl font-black mb-3">Annihilation Pass</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8 flex-grow">
                Unlimited access to all current and future acts. Cancel anytime.
              </p>
              <div className="text-4xl font-black mb-8 text-[#facc15]">
                $5 <span className="text-sm font-normal text-[var(--text-muted)]">/ month</span>
              </div>
              <Link href="/auth" className="btn-primary w-full block text-center !bg-[#facc15] !text-black shadow-lg shadow-[#facc15]/20">
                Get Unlimited Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 px-6 border-t border-[var(--border-color)] text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-4 font-black text-lg">
          <span>🎪</span>
          <span className="gradient-text">One Buck Circus</span>
        </div>
        <p className="text-[10px] font-bold text-[var(--text-muted)] mb-8 max-w-xs mx-auto leading-relaxed uppercase tracking-widest">
          Unlimited Acts. One Low Monthly Price. No Regrets.
        </p>
      </footer>
    </main>
  );
}
