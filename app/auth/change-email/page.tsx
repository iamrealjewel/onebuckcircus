"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import RoastOverlay from "@/components/RoastOverlay";

function ChangeEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [roastText, setRoastText] = useState("");

  if (!token) {
    return <div className="text-center p-8 text-red-500 font-bold">Invalid or missing token.</div>;
  }

  if (success) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-green-500">Check Your New Inbox!</h2>
        <p className="text-[var(--text-muted)] font-medium">We've dispatched a final confirmation scroll to your new email address. Click the link inside to complete the transition.</p>
        <button onClick={() => router.push("/")} className="btn-primary w-full mt-6 py-4">Return to Tent</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newEmail })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(await res.text() || "Failed to update email.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="card-glass p-10 animate-fade-in w-full max-w-md relative z-10">
      <RoastOverlay mode="change-email" onRoastFetched={setRoastText} />
      <h1 className="text-3xl font-black mb-2 text-center">New Identity</h1>
      <div className="min-h-[40px] mb-8 text-center">
        {roastText ? (
          <p className="text-[var(--brand-accent)] font-bold animate-in zoom-in duration-500">{roastText}</p>
        ) : (
          <p className="text-[var(--text-muted)] font-medium">Enter your new secure email address below.</p>
        )}
      </div>
      
      {error && <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold text-center border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">New Email Address</label>
          <div className="relative">
            <input 
              type="email" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
              placeholder="new@circus.com"
              className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-12 py-4 focus:border-purple-500 outline-none transition-all"
              required
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !newEmail}
          className="w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20"
        >
          {loading ? "Forging..." : "Update Email"}
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>
    </div>
  );
}

export default function ChangeEmailPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-surface)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-purple-500 font-bold animate-pulse z-10">Initializing secure link...</div>}>
        <div className="relative z-10 w-full flex justify-center">
          <ChangeEmailForm />
        </div>
      </Suspense>
    </main>
  );
}
