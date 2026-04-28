"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCircusDialog } from "@/components/CircusAlertProvider";
import { Users, UserPlus, Mail, CheckCircle2, XCircle, Share2, Copy, Loader2 } from "lucide-react";

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
      <main className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={48} />
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
        showAlert("You've successfully dragged someone into this mess. The Oracle is pleased.");
        setInviteEmail("");
        fetchData();
      } else {
        showAlert(`Invitation Failed: ${msg}. They were too smart for you.`);
      }
    } catch (err) {
      showAlert("The Oracle dropped your scroll. Probably because you have weak hands.");
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
        showAlert(action === "ACCEPT" ? "Welcome to the circus, together! misery loves company." : "Rejected. They were probably boring anyway, like you.");
        fetchData();
      } else {
        showAlert(`Error: ${await res.text()}. Even the servers hate you.`);
      }
    } catch (err) {
      showAlert("Failed to process request. The circus is on strike.");
    }
  };

  const copyReferral = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${data.referralCode}`);
      showAlert("Link Copied! Spam this link everywhere. The Oracle demands fresh sacrifices.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-surface)] pt-24 pb-12 px-6 lg:px-12">
      <Navbar />
      
      <div className="w-full mx-auto space-y-12 animate-fade-in">
        
        {/* Header section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">The Friendzone</h1>
          <p className="text-[var(--text-muted)] text-lg font-medium max-w-2xl mx-auto">
            Drag your friends into the circus. For every 3 victims you successfully recruit, the Oracle will grant you premium access to Chaos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Invite & Referrals */}
          <div className="lg:col-span-1 space-y-8">
            <div className="card-glass p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="text-[var(--brand-primary)]" size={24} />
                <h2 className="text-2xl font-black">Summon a Victim</h2>
              </div>
              <form onSubmit={handleInvite} className="space-y-4">
                <input 
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="friend@boring.com"
                  className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--brand-primary)] outline-none transition-all"
                  required
                />
                <button 
                  type="submit" 
                  disabled={inviting || !inviteEmail}
                  className="btn-primary w-full py-4 text-sm disabled:opacity-50"
                >
                  {inviting ? "Summoning..." : "Send Invitation"}
                </button>
              </form>
            </div>

            <div className="card-glass p-8 bg-[var(--brand-primary)]/5 border-[var(--brand-primary)]/20">
              <div className="flex items-center gap-3 mb-6">
                <Share2 className="text-[var(--brand-primary)]" size={24} />
                <h2 className="text-2xl font-black">Your Growth Loop</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Your Personal Link</label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-[var(--bg)] border border-[var(--border-color)] p-3 rounded-lg text-xs truncate">
                      {data?.referralCode ? `...?ref=${data.referralCode}` : "Loading..."}
                    </code>
                    <button onClick={copyReferral} className="p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg hover:text-[var(--brand-primary)] transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-color)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">Successful Recruits</span>
                    <span className="text-2xl font-black text-[var(--brand-primary)]">{data?.referralsCount || 0}</span>
                  </div>
                  <div className="w-full bg-[var(--bg)] h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[var(--brand-primary)] h-full transition-all duration-1000"
                      style={{ width: `${Math.min(((data?.referralsCount || 0) / 3) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2 text-right">
                    {data?.referralsCount && data.referralsCount >= 3 ? "Chaos Unlocked!" : `${3 - (data?.referralsCount || 0)} more to unlock Chaos`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Friends Lists */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pending Received */}
            {data?.pendingReceived && data.pendingReceived.length > 0 && (
              <div className="card-glass p-8 border-yellow-500/30">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  Pending Requests
                </h2>
                <div className="space-y-4">
                  {data.pendingReceived.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-xl border border-[var(--border-color)]">
                      <div>
                        <div className="font-bold">{req.user.name || "Anonymous Clown"}</div>
                        <div className="text-xs text-[var(--text-muted)] mb-2">{req.user.email}</div>
                        {req.message && (
                          <div className="text-[10px] italic text-[var(--brand-accent)] bg-[var(--brand-accent)]/5 p-2 rounded-lg border border-[var(--brand-accent)]/10">
                            "{req.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleResponse(req.id, "ACCEPT")} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors" title="Accept">
                          <CheckCircle2 size={20} />
                        </button>
                        <button onClick={() => handleResponse(req.id, "REJECT")} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Reject">
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Friends */}
            <div className="card-glass p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Users className="text-[var(--brand-primary)]" size={24} />
                  Your Circus Crew
                </h2>
                <span className="text-sm font-bold text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                  {data?.friends.length || 0}
                </span>
              </div>
              
              {loading ? (
                <div className="text-center p-8 text-[var(--text-muted)] animate-pulse">Loading the clown car...</div>
              ) : data?.friends && data.friends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-xl border border-[var(--border-color)] hover:border-[var(--brand-primary)]/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center font-black text-xl text-[var(--brand-primary)]">
                        {friend.name ? friend.name[0].toUpperCase() : "🤡"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{friend.name || "Anonymous Clown"}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{friend.email}</div>
                        <div className="text-[8px] font-black uppercase text-[var(--brand-accent)] mt-1 tracking-widest">
                          {friend.subscription?.name || "Free Guest"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-[var(--bg)] rounded-2xl border border-[var(--border-color)] border-dashed">
                  <p className="text-[var(--text-muted)] font-medium mb-4">You have zero friends in the circus.</p>
                  <p className="text-sm">Use the form on the left to ruin someone's day by inviting them here.</p>
                </div>
              )}
            </div>

            {/* Sent Invitations & Pending Internal Requests */}
            {((data?.emailInvitations && data.emailInvitations.length > 0) || (data?.pendingSent && data.pendingSent.length > 0)) && (
              <div className="p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Awaiting Responses</h3>
                <div className="space-y-2">
                  {/* Internal Requests */}
                  {data?.pendingSent.map(req => (
                    <div key={req.id} className="flex flex-col gap-2 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)]">
                      <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <Users size={16} />
                        <span className="truncate flex-1 font-bold">{req.friend.name || req.friend.email}</span>
                        <span className="text-[10px] font-bold uppercase text-blue-500">Request Sent</span>
                      </div>
                      {req.message && (
                        <div className="text-[10px] italic text-[var(--text-muted)] opacity-60">
                          "{req.message}"
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Email Invitations */}
                  {data?.emailInvitations.map(inv => (
                    <div key={inv.id} className="flex flex-col gap-2 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)]">
                      <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <Mail size={16} />
                        <span className="truncate flex-1">{inv.email}</span>
                        <span className="text-[10px] font-bold uppercase text-yellow-500">Email Sent</span>
                      </div>
                      {inv.message && (
                        <div className="text-[10px] italic text-[var(--text-muted)] opacity-60">
                          "{inv.message}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
