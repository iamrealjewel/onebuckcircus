"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Swords, X, Check, Skull, Flame, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DuelSummonOverlay() {
  const { data: session } = useSession();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;

    const checkInvitations = async () => {
      try {
        const res = await fetch("/api/duel/tic-tac-toe/check");
        if (res.ok) {
          const data = await res.json();
          const currentUrl = new URL(window.location.href);
          const currentDuelId = currentUrl.searchParams.get("duelId");
          
          // Show if we have a pending duel and we're not currently in it
          if (data.duel && data.duel.id !== currentDuelId) {
            setInvitation(data.duel);
          } else if (!data.duel) {
            setInvitation(null);
          }
        }
      } catch (err) {
        // Silent fail to avoid spamming console in production
      }
    };

    // Accelerated heartbeat: 3 seconds for immediate street-fight feel
    const interval = setInterval(checkInvitations, 3000);
    return () => clearInterval(interval);
  }, [session]);

  const handleAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!invitation) return;
    setLoading(true);
    try {
      const res = await fetch("/api/duel/tic-tac-toe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, duelId: invitation.id })
      });
      
      if (res.ok) {
        if (action === 'ACCEPT') {
          router.push(`/tools/tic-tac-toe?duelId=${invitation.id}`);
        }
        setInvitation(null);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (!invitation) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border-4 border-yellow-500 rounded-[40px] shadow-[0_0_150px_rgba(255,215,0,0.5)] overflow-hidden">
        
        {/* FLASHING STREET FIGHT HEADER */}
        <div className="bg-yellow-500 py-8 px-10 flex items-center justify-between animate-pulse">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl">
                 <Swords size={36} className="text-yellow-500 animate-bounce" />
              </div>
              <div className="space-y-1">
                 <h2 className="text-4xl font-black italic uppercase text-black tracking-tighter leading-none">Challenge Issued!</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">The Arena Awaits Your Decree</p>
              </div>
           </div>
           <Skull size={50} className="text-black/10" />
        </div>

        <div className="p-12 flex flex-col items-center text-center space-y-10">
           <div className="relative group">
              <div className="w-40 h-40 rounded-[50px] bg-[var(--bg-surface)] border-4 border-yellow-500 flex items-center justify-center text-6xl font-black shadow-2xl relative z-10 overflow-hidden group-hover:scale-105 transition-transform">
                 {invitation.player1.image ? (
                   <img src={invitation.player1.image} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <span>{invitation.player1.name?.[0].toUpperCase() || "🤡"}</span>
                 )}
              </div>
              <div className="absolute -inset-6 bg-yellow-500/30 blur-3xl rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-xl z-20">
                 <Flame size={24} className="text-black" />
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-4xl font-black uppercase text-white tracking-tight leading-tight">
                 <span className="text-yellow-500">{invitation.player1.name}</span> <br/> 
                 Wants to Humiliate You!
              </h3>
              <p className="text-[var(--text-muted)] text-lg font-bold italic max-w-md mx-auto">
                 "They have stepped into the Royal Arena and called for your blood. Will you rise to the challenge or hide in the shadows?"
              </p>
           </div>

           <div className="grid grid-cols-2 gap-8 w-full">
              <button 
                onClick={() => handleAction('ACCEPT')}
                disabled={loading}
                className="group relative px-10 py-7 rounded-full bg-yellow-500 text-black font-black uppercase italic shadow-[0_20px_50px_rgba(255,215,0,0.3)] hover:scale-105 transition-all overflow-hidden flex items-center justify-center gap-4 disabled:opacity-50"
              >
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                 {loading ? <Zap className="animate-spin" /> : (
                   <>
                     <Check size={28} className="stroke-[4px]" />
                     <span className="text-lg">Accept Fight</span>
                   </>
                 )}
              </button>
              
              <button 
                onClick={() => handleAction('REJECT')}
                disabled={loading}
                className="px-10 py-7 rounded-full bg-red-600/10 text-red-500 font-black uppercase italic border-4 border-red-500/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl"
              >
                 {loading ? <Zap className="animate-spin" /> : (
                   <>
                     <X size={28} className="stroke-[4px]" />
                     <span className="text-lg">Decline</span>
                   </>
                 )}
              </button>
           </div>
        </div>

        {/* DECORATIVE BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
        </div>
      </div>
    </div>
  );
}
