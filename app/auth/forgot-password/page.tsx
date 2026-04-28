"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import RoastOverlay from "@/components/RoastOverlay";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [roastText, setRoastText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(await res.text() || "Failed to process request.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-surface)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <RoastOverlay mode="forgot-password" onRoastFetched={setRoastText} />
      <Navbar />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--brand-primary)]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md card-glass p-10 text-center animate-fade-in">
        {success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-green-500">Amnesia Cure Sent</h2>
            <p className="text-[var(--text-muted)] font-medium">If an account exists with that email, we've sent a magic link to cure your amnesia.</p>
            <button onClick={() => router.push("/auth")} className="btn-primary w-full py-4 mt-6">Return to Circus</button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black mb-2">Memory Loss?</h1>
            <div className="min-h-[40px] mb-8">
              {roastText ? (
                <p className="text-[var(--brand-accent)] font-bold animate-in zoom-in duration-500">{roastText}</p>
              ) : (
                <p className="text-[var(--text-muted)] font-medium">Enter your email and the Oracle will try to jog your memory with a reset link.</p>
              )}
            </div>
            
            {error && <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="performer@circus.com"
                    className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-12 py-4 focus:border-[var(--brand-primary)] outline-none transition-all"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !email}
                className="btn-primary w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-lg shadow-[var(--brand-primary)]/20"
              >
                {loading ? "Summoning Oracle..." : "Send Reset Link"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
            
            <div className="pt-6 mt-6 border-t border-[var(--border-color)]">
              <button 
                onClick={() => router.push("/auth")}
                className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors underline decoration-dashed underline-offset-4"
              >
                Wait, I remembered it! Take me back 🏃💨
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
