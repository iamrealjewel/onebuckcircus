"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Sparkles, Swords } from "lucide-react";

export default function LandingClient({ tools }: any) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'ACTS' | 'GAMES'>('ACTS');

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
            <Link href={session ? "/" : "/auth"} className="btn-primary text-xl px-12 py-5">
              {session ? "🎪 Go to Dashboard" : "🎪 Enter the Tent"}
            </Link>
            <Link href="#tools" className="btn-outline text-xl px-12 py-5">
              Browse Acts
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <section id="tools" className="w-full py-32 px-6 lg:px-12 bg-[var(--bg-surface)] flex flex-col items-center">
        <div className="w-full max-w-7xl">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-16">
            <div className="bg-[var(--bg)] border border-[var(--border-color)] p-1.5 rounded-[30px] flex items-center gap-2 backdrop-blur-xl shadow-2xl">
              <button 
                onClick={() => setActiveTab('ACTS')}
                className={`px-12 py-4 rounded-[25px] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === 'ACTS' ? 'bg-[var(--brand-primary)] text-white shadow-[0_10px_30px_rgba(var(--brand-primary-rgb),0.3)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
              >
                <Sparkles size={16} /> The Theater
              </button>
              <button 
                onClick={() => setActiveTab('GAMES')}
                className={`px-12 py-4 rounded-[25px] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === 'GAMES' ? 'bg-yellow-500 text-black shadow-[0_10px_30px_rgba(255,215,0,0.3)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
              >
                <Swords size={16} /> The Arena
              </button>
            </div>
          </div>

          <div className="relative min-h-[600px]">
            {/* THEATRICAL ACTS */}
            <div className={`transition-all duration-700 ${activeTab === 'ACTS' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}>
              <div className="text-center mb-16 flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-xl">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">The Theatrical Acts</h2>
                <p className="text-[var(--text-muted)] font-medium text-lg uppercase tracking-widest text-[10px]">Creative & Analytical Circus Performances</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.filter((t:any) => !['tic-tac-toe', 'roast-buddy'].includes(t.id)).map((tool:any) => (
                  <div key={tool.id} className="card-glass h-full p-8 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-5xl">{tool.emoji}</span>
                    </div>
                    <div className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: tool.color }}>{tool.tagline}</div>
                    <h3 className="text-2xl font-black mb-3">{tool.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow">{tool.desc}</p>
                    <div className="space-y-2">
                      {tool.examples.map((ex:any) => (
                        <div key={ex} className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tool.color }} />
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GAMING ARENA */}
            <div className={`transition-all duration-700 ${activeTab === 'GAMES' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}>
              <div className="text-center mb-16 flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 shadow-xl">
                  <Swords size={32} />
                </div>
                <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">The Gaming Arena</h2>
                <p className="text-[var(--text-muted)] font-medium text-lg uppercase tracking-widest text-[10px]">Competitive Duels & Social Combat</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.filter((t:any) => ['tic-tac-toe', 'roast-buddy'].includes(t.id)).map((tool:any) => (
                  <div key={tool.id} className="card-glass h-full p-8 flex flex-col opacity-80 hover:opacity-100 transition-opacity border-yellow-500/20">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-5xl">{tool.emoji}</span>
                    </div>
                    <div className="text-[10px] font-black tracking-widest uppercase mb-2 text-yellow-500">{tool.tagline}</div>
                    <h3 className="text-2xl font-black mb-3">{tool.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow">{tool.desc}</p>
                    <div className="space-y-2 mb-8">
                      {tool.examples.map((ex:any) => (
                        <div key={ex} className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
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
                  <Link href={session ? "/circus-pass" : "/auth"} className="btn-primary w-full block text-center !bg-[#facc15] !text-black shadow-lg shadow-[#facc15]/20">
                    {session ? "Upgrade to Unlimited" : "Get Unlimited Access"}
                  </Link>
                </div>
              </div>
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
