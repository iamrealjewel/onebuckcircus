"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Check, ArrowRight, Lock, Sparkles, Clock, Swords, Dices } from "lucide-react";

const actsList = [
  { id: "roast-buddy", emoji: "🤝", name: "RoastBuddy", desc: "Live friend roasting arena.", tagline: "The Arena of Insults" },
  { id: "settle-it", emoji: "⚖️", name: "Settle It", desc: "Official court-style verdicts.", tagline: "Argument Court" },
  { id: "life-as-movie", emoji: "🎬", name: "Life as a Movie", desc: "Your story, Hollywood style.", tagline: "Hollywood Pitch Generator" },
  { id: "roast-my-idea", emoji: "🔥", name: "Roast My Idea", desc: "Brutal honesty for your dreams.", tagline: "Brutal Honest Feedback" },
  { id: "name-it", emoji: "✨", name: "Name It", desc: "The Oracle finds the perfect name.", tagline: "The Naming Oracle" },
  { id: "breakup-receipt", emoji: "🧾", name: "Breakup Receipt", desc: "Closure for your investments.", tagline: "Emotional Closure Machine" },
  { id: "tic-tac-toe", emoji: "❌", name: "Tic-Tac-Toe", desc: "Play a chaotic game of Tic-Tac-Toe.", tagline: "The Oracle's Gambit" },
];

export default function SelectActsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTS' | 'GAMES'>('ACTS');

  const user = session?.user as any;
  const maxActs = user?.maxActs || 0;
  const isAnnihilation = user?.subscriptionType === "ANNIHILATION";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (user?.role === "ADMIN") router.push("/admin");
    if (isAnnihilation) router.push("/");
    
    const fetchMatrix = async () => {
      try {
        const res = await fetch("/api/admin/subscription-matrix");
        if (res.ok) {
          const data = await res.json();
          setMatrix(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Matrix fetch failed:", err);
      }
    };
    fetchMatrix();
  }, [status, isAnnihilation, user, router]);

  const isActFree = (actId: string) => {
    const config = matrix.find(m => m.subscriptionId === user?.subscriptionId && m.actId === actId);
    if (!config) return false;
    return config.isFree || (config.freeUntil && new Date(config.freeUntil) > new Date());
  };

  const toggleAct = (id: string) => {
    if (isActFree(id)) return;

    if (selected.includes(id)) {
      setSelected(selected.filter(a => a !== id));
      setToastMessage(null);
    } else if (selected.length < maxActs) {
      setSelected([...selected, id]);
    } else {
      setToastMessage(`Greedy much? You only paid for ${maxActs} act${maxActs > 1 ? 's' : ''}. Upgrade to Annihilation if you want it all! 🤡`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const initiateSave = () => {
    if (selected.length !== maxActs) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await fetch("/api/user/select-acts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds: selected }),
      });

      if (res.ok) {
        await update();
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const subType = user?.subscriptionType || "NONE";
  
  const getSubMessage = (type: string) => {
    switch (type) {
      case "CHAOS": return "Chaos Pass: A controlled dose of madness.";
      case "DESTRUCTION": return "Destruction Tier: Half the circus is yours.";
      default: return "Your ticket to the show.";
    }
  };

  const getSubColor = (type: string) => {
    switch (type) {
      case "CHAOS": return "text-lime-400 border-lime-500/30 bg-lime-500/10";
      case "DESTRUCTION": return "text-rose-500 border-rose-500/20 bg-rose-500/10";
      default: return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    }
  };

  if (status === "loading") return null;

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-5xl text-center flex flex-col items-center animate-fade-in">
        <div className={`px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest mb-8 shadow-lg ${getSubColor(subType)}`}>
          🎟️ {getSubMessage(subType)}
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter uppercase">Choose Your Arsenal</h1>
        <p className="text-[var(--text-muted)] text-lg mb-12 font-medium">
          Select <strong className="text-[var(--brand-primary)]">{maxActs} acts</strong> to lock into your monthly lineup.
        </p>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/5 border border-white/10 p-1.5 rounded-[30px] flex items-center gap-2 backdrop-blur-xl shadow-2xl">
            <button 
              onClick={() => setActiveTab('ACTS')}
              className={`px-12 py-4 rounded-[25px] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === 'ACTS' ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
            >
              <Sparkles size={16} /> The Theater
            </button>
            <button 
              onClick={() => setActiveTab('GAMES')}
              className={`px-12 py-4 rounded-[25px] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === 'GAMES' ? 'bg-yellow-500 text-black shadow-lg' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
            >
              <Swords size={16} /> The Arena
            </button>
          </div>
        </div>

        <div className="w-full relative min-h-[400px] mb-24">
          {/* THEATRICAL ACTS */}
          <div className={`transition-all duration-700 ${activeTab === 'ACTS' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actsList.filter(a => !['tic-tac-toe', 'roast-buddy'].includes(a.id)).map((act) => {
                const isFree = isActFree(act.id);
                const isSelected = selected.includes(act.id) || isFree;
                return (
                  <button 
                    key={act.id}
                    onClick={() => toggleAct(act.id)}
                    disabled={isFree}
                    className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${isSelected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-2xl' : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--brand-primary)]/30 opacity-70 hover:opacity-100'} ${!isSelected && selected.length >= maxActs ? 'opacity-40 cursor-not-allowed' : ''} ${isFree ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                  >
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-500">{act.emoji}</div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest uppercase mb-1 opacity-60">{act.tagline}</div>
                      <div className="font-black text-2xl mb-2">{act.name}</div>
                      <div className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">{act.desc}</div>
                    </div>
                    {isFree && (
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest">RINGMASTER'S GIFT</div>
                      </div>
                    )}
                    {!isFree && isSelected && (
                      <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-lg animate-scale-in">
                        <Check size={18} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GAMING ARENA */}
          <div className={`transition-all duration-700 ${activeTab === 'GAMES' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actsList.filter(a => ['tic-tac-toe', 'roast-buddy'].includes(a.id)).map((act) => {
                const isFree = isActFree(act.id);
                const isSelected = selected.includes(act.id) || isFree;
                return (
                  <button 
                    key={act.id}
                    onClick={() => toggleAct(act.id)}
                    disabled={isFree}
                    className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${isSelected ? 'border-yellow-500 bg-yellow-500/5 shadow-2xl' : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-yellow-500/30 opacity-70 hover:opacity-100'} ${!isSelected && selected.length >= maxActs ? 'opacity-40 cursor-not-allowed' : ''} ${isFree ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                  >
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-500">{act.emoji}</div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest uppercase mb-1 text-yellow-500/60">{act.tagline}</div>
                      <div className="font-black text-2xl mb-2">{act.name}</div>
                      <div className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">{act.desc}</div>
                    </div>
                    {!isFree && isSelected && (
                      <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-lg animate-scale-in">
                        <Check size={18} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* HUD FOOTER */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-40">
          <div className="card-glass p-8 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-white/20">
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Your Selection</div>
                <div className="text-2xl font-black">{selected.length} <span className="text-[var(--text-muted)] text-base">/ {maxActs}</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Status</div>
                <div className={`text-xs font-black uppercase ${selected.length === maxActs ? 'text-[var(--brand-primary)]' : 'text-orange-400'}`}>
                  {selected.length === maxActs ? 'READY TO LOCK' : 'NEED MORE ACTS'}
                </div>
              </div>
            </div>
            
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]" 
                style={{ width: `${(selected.length / maxActs) * 100}%` }}
              />
            </div>

            <button 
              onClick={initiateSave}
              disabled={selected.length !== maxActs || loading}
              className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale transition-all duration-500"
            >
              {loading ? 'Committing Chaos...' : 'Lock Selections'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-[var(--bg-surface)] border-2 border-orange-500/50 text-orange-400 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm">
            {toastMessage}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--brand-primary)]" />
            <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center mb-8 border border-orange-500/20 shadow-inner">
              <Lock size={40} />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">No Take-Backs!</h2>
            <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-10 text-lg">
              Once you lock these in, your arsenal is frozen for <span className="text-[var(--brand-primary)] font-black">30 days</span>. The Ringmaster is strict about his schedule. Ready to commit?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-5 btn-outline rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">
                Wait, Abort!
              </button>
              <button onClick={confirmSave} className="flex-1 py-5 btn-primary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[var(--brand-primary)]/40">
                Lock It In
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
