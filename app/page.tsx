import Link from "next/link";
import Navbar from "@/components/Navbar";

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
    tagline: "The $1 Naming Oracle",
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
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Navbar />

      {/* HERO */}
      <section className="w-full relative pt-40 pb-24 px-6 overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--brand-primary)] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--brand-secondary)] rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-4xl text-center relative z-10 flex flex-col items-center">
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
            <Link href="/circus-pass" className="btn-primary text-xl px-12 py-5">
              🎪 Get Your Pass
            </Link>
            <Link href="#tools" className="btn-outline text-xl px-12 py-5">
              Browse Acts
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <section id="tools" className="w-full py-24 px-6 bg-[var(--bg-surface)] flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4">The Acts</h2>
            <p className="text-[var(--text-muted)] font-medium text-lg">Choose any 2 for $1/mo, or all of them for just $2/mo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`} className="group h-full">
                <div className="card-glass h-full p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl group-hover:scale-110 transition-transform">{tool.emoji}</span>
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
                  <div className="font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: tool.color }}>
                    Try this act <span className="text-xl">→</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pass Card */}
            <div className="card-glass p-8 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border-[var(--brand-accent)]/20 flex flex-col items-center text-center">
              <div className="text-5xl mb-6">🎟️</div>
              <div className="text-[10px] font-black tracking-widest uppercase mb-2 text-[var(--brand-accent)]">BEST VALUE</div>
              <h3 className="text-2xl font-black mb-3">The Full Pass</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8 flex-grow">
                Unlimited access to all current and future acts. Cancel anytime.
              </p>
              <div className="text-4xl font-black mb-8">
                $2 <span className="text-sm font-normal text-[var(--text-muted)]">/ month</span>
              </div>
              <Link href="/circus-pass" className="btn-primary w-full block text-center">
                Get Unlimited Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TABLE SIMPLE */}
      <section className="w-full py-24 px-6 flex flex-col items-center border-t border-[var(--border-color)]">
        <div className="w-full max-w-4xl text-center">
          <h2 className="text-4xl font-black mb-16 text-center">Choose Your Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-10 flex flex-col items-center">
              <div className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase mb-4">THE SIDE SHOW</div>
              <div className="text-5xl font-black mb-2">$1<span className="text-lg text-[var(--text-muted)]">/mo</span></div>
              <p className="text-sm text-[var(--text-muted)] mb-8">Choose any 2 acts to use unlimited times.</p>
              <Link href="/circus-pass" className="btn-outline w-full">Start for $1</Link>
            </div>
            <div className="card-glass p-10 flex flex-col items-center border-[var(--brand-primary)]/40">
              <div className="text-[10px] font-black tracking-widest text-[var(--brand-primary)] uppercase mb-4">THE FULL CIRCUS</div>
              <div className="text-5xl font-black mb-2">$2<span className="text-lg text-[var(--text-muted)]">/mo</span></div>
              <p className="text-sm text-[var(--text-muted)] mb-8">Unlimited access to all 5 acts + all future releases.</p>
              <Link href="/circus-pass" className="btn-primary w-full bg-[var(--brand-primary)] text-white">Start for $2</Link>
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
        <div className="flex justify-center gap-6 text-[10px] font-black text-[var(--text-muted)] uppercase">
          <Link href="#" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          <Link href="#" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
