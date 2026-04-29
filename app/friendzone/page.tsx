"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCircusDialog } from "@/components/CircusAlertProvider";
import { 
  Users, UserPlus, Mail, CheckCircle2, XCircle, Share2, 
  Copy, Loader2, Swords, Flame, MessageSquare, ExternalLink,
  ShieldCheck, Zap, Sparkles, Trophy, Ghost
} from "lucide-react";
import Link from "next/link";
import { dispatchFriendRoast } from "@/app/actions/acts";

export default function FriendzonePage() {
  const [data, setData] = useState<{
    friends: any[],
    pendingReceived: any[],
    pendingSent: any[],
    emailInvitations: any[],
    referralCode: string,
    referralsCount: number
  } | null>(null);
  
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [actionStatus, setActionStatus] = useState<Record<string, 'challenging' | 'roasting' | null>>({});
  const { showAlert } = useCircusDialog();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <Loader2 className="animate-spin text-[var(--brand-primary)] mb-4" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Summoning the Crew...</p>
        </div>
      </main>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviting(true);
    try {
      const res = await fetch("/api/friends/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail })
      });
      
      const text = await res.text();
      let msg = text;
      try { const json = JSON.parse(text); msg = json.message; } catch {}

      if (res.ok) {
        showAlert("Recruitment scroll dispatched. Another soul lured into the tent.");
        setInviteEmail("");
        fetchData();
      } else {
        showAlert(`Oracle's Rejection: ${msg}`);
      }
    } catch (err) {
      showAlert("The pigeon died in transit. Try again.");
    }
    setInviting(false);
  };

  const handleResponse = async (friendshipId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action })
      });
      
      if (res.ok) {
        showAlert(action === "ACCEPT" ? "Welcome to the crew! Misery loves company." : "Discarded like a bad juggling pin.");
        fetchData();
      } else {
        showAlert(`Error: ${await res.text()}`);
      }
    } catch (err) {
      showAlert("Failed to process request. The Ringmaster is busy.");
    }
  };

  const handleChallenge = async (friend: any) => {
    setActionStatus(prev => ({ ...prev, [friend.id]: 'challenging' }));
    try {
      const res = await fetch("/api/friends/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: friend.email, actId: "tic-tac-toe" })
      });
      
      if (res.ok) {
        showAlert(`Arena Summon dispatched to ${friend.name || friend.email}. Prepare for combat.`);
      } else {
        const text = await res.text();
        showAlert(`Challenge Failed: ${text}`);
      }
    } catch (err) {
      showAlert("The arena gates are jammed. Try later.");
    }
    setActionStatus(prev => ({ ...prev, [friend.id]: null }));
  };

  const handleRoast = async (friend: any) => {
    setActionStatus(prev => ({ ...prev, [friend.id]: 'roasting' }));
    try {
      const roast = await dispatchFriendRoast(friend.id, friend.name || friend.email);
      showAlert(`Roast Dispatched: "${roast}"`);
    } catch (err) {
      showAlert("The roast was too spicy for the server to handle.");
    }
    setActionStatus(prev => ({ ...prev, [friend.id]: null }));
  };

  const copyReferral = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${data.referralCode}`);
      showAlert("Recruitment Link Copied! Spread the madness.");
    }
  };

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case "ANNIHILATION": return <Trophy className="text-purple-500" size={14} />;
      case "DESTRUCTION": return <Zap className="text-orange-500" size={14} />;
      case "CHAOS": return <Sparkles className="text-blue-500" size={14} />;
      default: return <Users className="text-gray-500" size={14} />;
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "ANNIHILATION": return "from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-400";
      case "DESTRUCTION": return "from-orange-600/20 to-yellow-600/20 border-orange-500/30 text-orange-400";
      case "CHAOS": return "from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-blue-400";
      default: return "from-gray-600/10 to-gray-800/10 border-gray-500/20 text-gray-400";
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] pt-16 pb-12 px-4 lg:px-10 overflow-x-hidden relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--brand-primary)]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand-secondary)]/5 blur-[100px] rounded-full" />
      </div>

      <Navbar />
      
      <div className="relative z-10 w-full max-w-full mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <div className="relative text-center py-6 px-4 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
             <Users size={14} className="text-[var(--brand-primary)]" /> The Social Spectacle
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] animate-in fade-in slide-in-from-bottom-4 duration-700">
             The <span className="gradient-text italic">Friendzone</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg font-bold max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
             Drag your victims into the tent. Recruit <span className="text-[var(--brand-primary)]">3 souls</span> to unlock the **Chaos Tier** for free. Forever.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Recruitment & Growth */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div className="card-glass p-8 border-t-4 border-t-[var(--brand-primary)] animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
                    <UserPlus size={20} />
                 </div>
                 <h2 className="text-2xl font-black uppercase">Summon</h2>
              </div>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="friend@victim.com"
                    className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-4 focus:border-[var(--brand-primary)] outline-none font-bold text-sm"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={inviting || !inviteEmail}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {inviting ? "Summoning..." : "Dispatched Scroll"}
                </button>
              </form>
            </div>

            <div className="card-glass p-8 relative overflow-hidden group animate-in fade-in slide-in-from-left-4 duration-1000 delay-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[var(--brand-secondary)]/10 flex items-center justify-center text-[var(--brand-secondary)]">
                   <Share2 size={20} />
                </div>
                <h2 className="text-2xl font-black uppercase">Recruits</h2>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">Your Link</label>
                  <div className="flex items-center gap-2 p-2 bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl">
                    <code className="flex-1 text-[10px] font-bold px-3 truncate opacity-60">
                      {data?.referralCode ? `...?ref=${data.referralCode}` : "Loading..."}
                    </code>
                    <button onClick={copyReferral} className="p-3 hover:text-[var(--brand-primary)] transition-all">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="pt-8 border-t border-[var(--border-color)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-black uppercase">Chaos Unlock</span>
                    <span className="text-3xl font-black text-[var(--brand-primary)]">
                      {data?.referralsCount || 0}/3
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg)] h-4 rounded-full p-1 border border-[var(--border-color)]">
                    <div 
                      className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((data?.referralsCount || 0) / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Social Feed & Management */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. SOCIAL COMMAND CONSOLE */}
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-8 bg-[var(--brand-primary)] rounded-full" />
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter">Social Command</h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-[var(--border-color)] to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* INCOMING REQUESTS - High Priority HUD */}
                {data?.pendingReceived && data.pendingReceived.length > 0 && (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative card-glass p-8 border-yellow-500/20 bg-yellow-500/5 backdrop-blur-2xl rounded-[30px] overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Users size={20} className="text-yellow-500" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500/80">Incoming Summoners</h3>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                          Action Required
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.pendingReceived.map(req => (
                          <div key={req.id} className="p-5 bg-[var(--bg)]/40 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-[var(--bg)]/60 transition-all hover:scale-[1.02] shadow-lg">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-500 font-black text-xl shadow-inner">
                                {req.user.name?.charAt(0) || "🤡"}
                              </div>
                              <div className="truncate">
                                <h4 className="font-black text-xs uppercase text-white truncate">{req.user.name || "Anonymous"}</h4>
                                <p className="text-[9px] text-[var(--text-muted)] font-bold truncate mt-0.5">{req.user.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleResponse(req.id, "ACCEPT")} className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm">
                                <CheckCircle2 size={18} />
                              </button>
                              <button onClick={() => handleResponse(req.id, "REJECT")} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <XCircle size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* RECRUITMENT LEDGER - Sleek Log style */}
                {((data?.emailInvitations && data.emailInvitations.length > 0) || (data?.pendingSent && data.pendingSent.length > 0)) && (
                  <div className="card-glass p-8 bg-white/[0.02] border-white/5 rounded-[30px]">
                    <div className="flex items-center gap-4 mb-8">
                       <Mail size={20} className="text-[var(--brand-primary)] opacity-60" />
                       <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-60">Recruitment Ledger</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data?.pendingSent.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-4 bg-[var(--bg)]/40 border border-white/5 rounded-2xl group hover:border-[var(--brand-primary)]/30 transition-all">
                           <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-500/60 group-hover:text-blue-500 transition-colors">
                                 <Users size={16} />
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="truncate font-black text-[10px] uppercase text-white/60 group-hover:text-white transition-colors">{req.friend.name || "Unknown"}</span>
                                <span className="text-[8px] font-bold text-[var(--text-muted)] truncate">{req.friend.email}</span>
                              </div>
                           </div>
                           <div className="text-[7px] font-black uppercase px-2 py-1 bg-blue-500/5 text-blue-500/60 rounded-md border border-blue-500/10">Awaiting</div>
                        </div>
                      ))}
                      {data?.emailInvitations.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-[var(--bg)]/40 border border-white/5 rounded-2xl group hover:border-yellow-500/30 transition-all">
                           <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-yellow-500/5 flex items-center justify-center text-yellow-500/60 group-hover:text-yellow-500 transition-colors">
                                 <Zap size={16} />
                              </div>
                              <span className="truncate text-[10px] font-black uppercase text-white/40 group-hover:text-white/60 transition-colors">{inv.email}</span>
                           </div>
                           <div className="text-[7px] font-black uppercase px-2 py-1 bg-yellow-500/5 text-yellow-500/60 rounded-md border border-yellow-500/10">Sent</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. THE CIRCUS CREW - High End Dossier style */}
            <div className="space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
                       <Users size={24} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Circus Crew</h2>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-surface)] flex items-center justify-center text-[8px] font-black">🤡</div>
                       ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {data?.friends.length || 0} Online
                    </span>
                  </div>
               </div>

               {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="card-glass h-48 animate-pulse opacity-50" />
                   ))}
                </div>
               ) : data?.friends && data.friends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {data.friends.map(friend => {
                    const tier = friend.subscription?.tier || "NONE";
                    return (
                      <div key={friend.id} className="group relative">
                        {/* Dossier Card */}
                        <div className={`relative card-glass p-6 h-full transition-all duration-500 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-2 ${tier === 'ANNIHILATION' ? 'border-t-purple-500/50' : tier === 'DESTRUCTION' ? 'border-t-orange-500/50' : tier === 'CHAOS' ? 'border-t-blue-500/50' : 'border-t-[var(--border-color)]'}`}>
                           
                           {/* Glow Effect */}
                           <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${tier === 'ANNIHILATION' ? 'bg-purple-500' : tier === 'DESTRUCTION' ? 'bg-orange-500' : 'bg-blue-500'}`} />

                           <div className="flex items-start justify-between">
                              <div className="flex gap-5">
                                 {/* Performer Portrait */}
                                 <div className="relative">
                                    <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-3xl font-black shadow-2xl relative overflow-hidden group-hover:border-[var(--brand-primary)]/50 transition-all">
                                       {friend.name ? friend.name[0].toUpperCase() : "🤡"}
                                       <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[var(--bg-card)] rounded-full shadow-lg shadow-green-500/30" />
                                 </div>

                                 {/* Performer Metadata */}
                                 <div className="space-y-3 pt-1">
                                    <h4 className="text-xl font-black uppercase tracking-tighter text-white leading-none group-hover:text-[var(--brand-primary)] transition-colors">{friend.name || "Anonymous Clown"}</h4>
                                    <div className="flex flex-col gap-1.5">
                                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.1em] w-fit ${getTierColor(tier)}`}>
                                          {getTierIcon(tier)} {tier}
                                       </div>
                                       <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-tight truncate max-w-[120px]">{friend.email}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Action HUD */}
                              <div className="flex flex-col gap-2 pt-1">
                                 <button 
                                   onClick={() => handleChallenge(friend)}
                                   disabled={actionStatus[friend.id] === 'challenging'}
                                   className="w-11 h-11 flex items-center justify-center bg-white/[0.03] text-[var(--brand-primary)] rounded-2xl border border-white/5 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all active:scale-90 group/btn disabled:opacity-50"
                                   title="Oracle's Gambit"
                                 >
                                    {actionStatus[friend.id] === 'challenging' ? (
                                      <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                      <Swords size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                    )}
                                 </button>
                                 <button 
                                   onClick={() => handleRoast(friend)}
                                   disabled={actionStatus[friend.id] === 'roasting'}
                                   className="w-11 h-11 flex items-center justify-center bg-white/[0.03] text-orange-500 rounded-2xl border border-white/5 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-90 group/btn disabled:opacity-50"
                                   title="Dispatch Roast"
                                 >
                                    {actionStatus[friend.id] === 'roasting' ? (
                                      <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                      <Flame size={20} className="group-hover/btn:scale-110 transition-transform" />
                                    )}
                                 </button>
                              </div>
                           </div>
                           
                           {/* Dossier Footer */}
                           <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
                              <div className="flex gap-6">
                                 <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Experience</span>
                                    <span className="text-[10px] font-black text-white/80">Fresh Blood</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Alliance</span>
                                    <span className="text-[10px] font-black text-white/80">Verified</span>
                                 </div>
                              </div>
                              <Link href={`/roast-buddy/${friend.id}`} className="p-2 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all">
                                 <ExternalLink size={14} />
                              </Link>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
               ) : (
                <div className="relative group p-20 text-center card-glass border-dashed border-2 border-white/5 flex flex-col items-center justify-center space-y-8 overflow-hidden rounded-[40px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-24 h-24 rounded-[32px] bg-[var(--bg)] border border-white/5 flex items-center justify-center relative z-10 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                     <Ghost size={48} className="text-[var(--text-muted)] opacity-30 animate-pulse" />
                  </div>
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Deserted Tent</h3>
                    <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto leading-relaxed font-medium">Your social circle is as empty as a clown's promises. Step into the Summoning Circle to recruit some fresh performers.</p>
                  </div>
                </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
