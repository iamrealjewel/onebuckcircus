"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Star, Dices, Zap, Crown, Flame, ShieldAlert, Sparkles, Swords } from "lucide-react";

export default function DashboardClient({ user, subscription, selectedActs, availableActs }: any) {
  const [activeTab, setActiveTab] = useState<'ACTS' | 'GAMES'>('ACTS');
  const subType = subscription?.tier || "NONE";
  const isAnnihilation = subType === "ANNIHILATION";
  
  let themeColor = "var(--brand-primary)";
  let badgeIcon = <Sparkles size={16} />;
  let welcomeMessage = "Welcome to the Big Top";

  if (subType === "CHAOS") {
    themeColor = "var(--color-chaos)";
    badgeIcon = <Dices size={16} />;
    welcomeMessage = "Embrace the Chaos";
  } else if (subType === "DESTRUCTION") {
    themeColor = "var(--color-destruction)";
    badgeIcon = <Zap size={16} />;
    welcomeMessage = "Unleash Destruction";
  } else if (subType === "ANNIHILATION") {
    themeColor = "var(--color-annihilation)";
    badgeIcon = <Crown size={16} />;
    welcomeMessage = "Absolute Power";
  }

  const daysLeft = user?.subscriptionEnd ? Math.ceil((new Date(user.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  return (
    <main className="min-h-screen flex flex-col items-center pb-24">
      <Navbar />

      <section className="w-full relative pt-32 pb-12 px-6 lg:px-12 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          {/* Header */}
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
            {subType === "NONE" ? (
              <Link href="/circus-pass" className="btn-primary py-4 px-8 text-sm">
                Get Your Pass <ArrowRight size={16} className="ml-2 inline" />
              </Link>
            ) : !isAnnihilation && (
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Acts Locked In</div>
                <div className="text-3xl font-black">{selectedActs.length} <span className="text-[var(--text-muted)] text-lg">/ {subscription?.maxActs}</span></div>
              </div>
            )}
          </div>

          {/* Warnings */}
          {isExpiringSoon && (
            <div className="w-full p-6 rounded-3xl border border-red-500/50 bg-red-500/10 mb-8 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <ShieldAlert className="text-red-500" size={32} />
                <div>
                   <h3 className="text-xl font-black text-red-500 uppercase tracking-widest mb-1">Subscription Expiring</h3>
                   <p className="text-red-400 font-medium">Renew in {daysLeft} days to keep the chaos flowing.</p>
                </div>
              </div>
              <Link href="/circus-pass" className="btn-primary !bg-red-500 text-white">Renew Now</Link>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex justify-center mb-16">
            <div className="bg-white/5 border border-white/10 p-1.5 rounded-[30px] flex items-center gap-2 backdrop-blur-xl shadow-2xl">
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

          <div className="relative min-h-[500px]">
             {/* THEATER SECTION */}
             <div className={`transition-all duration-700 ${activeTab === 'ACTS' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">The Theatrical Acts</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Creative & Analytical Circus Performances</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {availableActs.filter((a:any) => !['tic-tac-toe', 'roast-buddy'].includes(a.id)).map((tool: any) => {
                      const isLocked = !isAnnihilation && !selectedActs.includes(tool.id) && !tool.isFree;
                      if (isLocked) {
                        return (
                          <div key={tool.id} className="card-glass h-full p-8 flex flex-col border-red-500/20 bg-red-500/5 opacity-80 group">
                            <div className="flex justify-between items-start mb-6">
                              <span className="text-5xl grayscale group-hover:grayscale-0 transition-all duration-500">🔒</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">{tool.name}</h3>
                            <p className="text-[var(--text-muted)] text-sm font-medium mb-6 flex-grow">This act is currently locked in your arsenal.</p>
                            <Link href="/select-acts" className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest text-center hover:bg-red-500 hover:text-white transition-all">
                              Select Act
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <Link key={tool.id} href={`/tools/${tool.id}`} className="card-glass h-full p-8 flex flex-col hover:border-[var(--brand-primary)] hover:shadow-[0_20px_50px_rgba(var(--brand-primary-rgb),0.15)] transition-all group relative overflow-hidden">
                           <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{tool.emoji}</span>
                           <h3 className="text-2xl font-black mb-3">{tool.name}</h3>
                           <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow">{tool.description}</p>
                           <div className="font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: tool.color }}>Launch Act <ArrowRight size={16} /></div>
                        </Link>
                      );
                   })}
                </div>
             </div>

             {/* ARENA SECTION */}
             <div className={`transition-all duration-700 ${activeTab === 'GAMES' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-lg">
                    <Swords size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">The Gaming Arena</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Competitive Duels & Social Combat</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {availableActs.filter((a:any) => ['tic-tac-toe', 'roast-buddy'].includes(a.id)).map((tool: any) => (
                      <Link key={tool.id} href={`/tools/${tool.id}`} className="card-glass h-full p-8 flex flex-col hover:border-yellow-500 hover:shadow-[0_20px_50px_rgba(255,215,0,0.15)] transition-all group border-yellow-500/20">
                         <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{tool.emoji}</span>
                         <h3 className="text-2xl font-black mb-3">{tool.name}</h3>
                         <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow text-yellow-500/80">Competitive Duel Arena</p>
                         <div className="font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all text-yellow-500">Enter Arena <ArrowRight size={16} /></div>
                      </Link>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
