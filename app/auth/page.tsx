"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Sparkles, ArrowRight, Lock, UserPlus, LogIn, Mail, MapPin, User as UserIcon, Calendar, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    gender: "Other",
    age: "",
    address: "",
    agree: false
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signup") {
      if (!formData.agree) {
        setError("You must agree to be a joker!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          setSuccess("Check your email to finalize your clown enrollment!");
          setMode("login");
        } else {
          const errText = await res.text();
          setError(errText || "Signup failed.");
        }
      } catch (err) {
        setError("Something went wrong during signup.");
      }
    } else {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (res?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(res?.error || "Login failed.");
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center">
      <Navbar />
      
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="card-glass p-10 md:p-14 text-center relative overflow-hidden">
          {/* Status Notifications */}
          {error && (
            <div className="absolute top-0 left-0 w-full bg-red-500/20 text-red-500 py-3 text-xs font-black uppercase tracking-widest animate-slide-down z-30">
              {error}
            </div>
          )}
          {success && (
            <div className="absolute top-0 left-0 w-full bg-green-500/20 text-green-500 py-3 text-xs font-black uppercase tracking-widest animate-slide-down z-30">
              {success}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl mb-12 max-w-xs mx-auto">
            <button 
              onClick={() => setMode("login")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "login" ? 'bg-[var(--brand-primary)] text-white shadow-xl' : 'text-[var(--text-muted)] hover:text-white'}`}
            >
              <LogIn size={18} /> Login
            </button>
            <button 
              onClick={() => setMode("signup")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "signup" ? 'bg-[var(--brand-primary)] text-white shadow-xl' : 'text-[var(--text-muted)] hover:text-white'}`}
            >
              <UserPlus size={18} /> Signup
            </button>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            {mode === "login" ? "Step Right Up" : "Join the Circus"}
          </h1>
          <p className="text-[var(--text-muted)] mb-14 text-lg font-medium max-w-xl mx-auto leading-relaxed">
            {mode === "login" ? "Welcome back to the beautiful chaos." : "Fill your scroll to become a certified joker."}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-8 text-left">
            {/* Single Column Stacked Layout */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="performer@circus.com"
                  className="w-full bg-[var(--bg)] border-2 border-[var(--border-color)] rounded-2xl px-14 py-6 text-lg focus:border-[var(--brand-primary)] outline-none transition-all shadow-inner"
                  required
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={24} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Secure Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg)] border-2 border-[var(--border-color)] rounded-2xl px-14 py-6 text-lg focus:border-[var(--brand-primary)] outline-none transition-all shadow-inner"
                  required
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={24} />
              </div>
            </div>

            {mode === "signup" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Full Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="John Joker"
                      className="w-full bg-[var(--bg)] border-2 border-[var(--border-color)] rounded-2xl px-14 py-6 text-lg focus:border-[var(--brand-primary)] outline-none transition-all shadow-inner"
                      required
                    />
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={24} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Gender</label>
                  <div className="relative">
                    <select 
                      value={formData.gender} 
                      onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                      className="w-full bg-[var(--bg)] border-2 border-[var(--border-color)] rounded-2xl px-8 py-6 text-lg focus:border-[var(--brand-primary)] outline-none appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Age</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.age} 
                      onChange={(e) => setFormData({...formData, age: e.target.value})} 
                      placeholder="25"
                      className="w-full bg-[var(--bg)] border-2 border-[var(--border-color)] rounded-2xl px-14 py-6 text-lg focus:border-[var(--brand-primary)] outline-none transition-all shadow-inner"
                      required
                    />
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={24} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Physical Address</label>
                  <div className="relative">
                    <textarea 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                      placeholder="123 Circus Way, Big Top City..."
                      className="w-full bg-[var(--bg)] border-2 border-[var(--border-color)] rounded-2xl px-14 py-6 text-lg focus:border-[var(--brand-primary)] outline-none min-h-[140px] transition-all shadow-inner"
                      required
                    />
                    <MapPin className="absolute left-5 top-7 text-[var(--text-muted)]" size={24} />
                  </div>
                </div>

                <label className="flex items-start gap-5 cursor-pointer group bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] hover:border-[var(--brand-primary)]/30 transition-all">
                  <input 
                    type="checkbox" 
                    checked={formData.agree} 
                    onChange={(e) => setFormData({...formData, agree: e.target.checked})}
                    className="mt-1 w-6 h-6 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                  <span className="text-sm text-[var(--text-muted)] font-medium leading-relaxed group-hover:text-white transition-colors">
                    I solemnly swear to be a <span className="text-[var(--brand-primary)] font-black">Joker</span> in this circus, to embrace the beautiful chaos, and to never settle for a boring reality.
                  </span>
                </label>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-7 text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl hover:scale-[1.01] transition-all"
            >
              {loading ? "Magic in progress..." : mode === "login" ? "Enter the Tent" : "Join the Circus"}
              {!loading && <ArrowRight size={28} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function ChevronDown({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
