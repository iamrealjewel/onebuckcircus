"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Check, ArrowRight, Lock, Sparkles, Clock } from "lucide-react";

const actsList = [
  { id: "settle-it", name: "Settle It", emoji: "⚖️", desc: "Official court-style verdicts." },
  { id: "life-as-movie", name: "Life as a Movie", emoji: "🎬", desc: "Your story, Hollywood style." },
  { id: "roast-my-idea", name: "Roast My Idea", emoji: "🔥", desc: "Brutal honesty for your dreams." },
  { id: "name-it", name: "Name It", emoji: "✨", desc: "The Oracle finds the perfect name." },
  { id: "breakup-receipt", name: "Breakup Receipt", emoji: "🧾", desc: "Closure for your investments." },
];

export default function SelectActsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const user = session?.user as any;
  const maxActs = user?.maxActs || 0;
  const isAnnihilation = user?.subscriptionType === "ANNIHILATION";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (isAnnihilation) router.push("/");
    if (user?.selectedApps?.length > 0) {
      // Check if they can change. For now, we'll just redirect if they already have them
      // In a real app, we'd check the date.
      router.push("/");
    }
  }, [status, isAnnihilation, user]);

  const toggleAct = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(a => a !== id));
    } else if (selected.length < maxActs) {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    if (selected.length !== maxActs) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/select-acts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds: selected }),
      });

      if (res.ok) {
        await update(); // Update session
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (status === "loading") return null;

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-4xl text-center flex flex-col items-center animate-fade-in">
        <div className="w-20 h-20 bg-[var(--bg-card)] rounded-3xl flex items-center justify-center mb-8 border border-[var(--border-color)]">
          <Sparkles className="text-[var(--brand-primary)]" size={40} />
        </div>
        
        <h1 className="text-5xl font-black mb-4 tracking-tighter">Choose Your Arsenal</h1>
        <p className="text-[var(--text-muted)] text-lg mb-4 font-medium">
          Your {user?.subscriptionType.toLowerCase()} ticket allows you to pick <strong>{maxActs} acts</strong>.
        </p>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-black uppercase tracking-widest mb-12">
          <Clock size={12} /> Selection locks for 30 days once confirmed
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
          {actsList.map((act) => (
            <button 
              key={act.id}
              onClick={() => toggleAct(act.id)}
              disabled={!selected.includes(act.id) && selected.length >= maxActs}
              className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${selected.includes(act.id) ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-2xl' : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--brand-primary)]/30 opacity-70 hover:opacity-100'}`}
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-500">{act.emoji}</div>
              <div>
                <div className="font-black text-lg mb-1">{act.name}</div>
                <div className="text-xs text-[var(--text-muted)] font-bold">{act.desc}</div>
              </div>
              
              {selected.includes(act.id) && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-lg animate-scale-in">
                  <Check size={14} />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md card-glass p-8 space-y-6">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest">
            <span className="text-[var(--text-muted)]">Selections</span>
            <span>{selected.length} / {maxActs}</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--brand-primary)] transition-all duration-500" 
              style={{ width: `${(selected.length / maxActs) * 100}%` }}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={selected.length !== maxActs || loading}
            className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-30"
          >
            {loading ? 'Committing Chaos...' : 'Lock Selections'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}
