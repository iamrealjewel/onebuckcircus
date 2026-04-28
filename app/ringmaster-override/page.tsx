"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      isAdminLogin: "true",
      redirect: false,
    });
    
    if (res?.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res?.error || "Access Denied. You are not the Ringmaster.");
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-surface)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-500/10 text-purple-500 rounded-3xl flex items-center justify-center mb-6 border-2 border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter">Control Center</h1>
          <p className="text-[var(--text-muted)] font-medium">Authorized personnel only.</p>
        </div>

        <div className="card-glass p-10 relative overflow-hidden border-purple-500/20">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Admin Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="admin@circus.com"
                  className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-12 py-4 focus:border-purple-500 outline-none transition-all"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Passcode</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-12 py-4 focus:border-purple-500 outline-none transition-all"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20 mt-4"
            >
              {loading ? "Verifying..." : "Override Protocol"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
