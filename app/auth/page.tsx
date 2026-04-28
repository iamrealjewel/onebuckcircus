"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Sparkles, ArrowRight, Lock, UserPlus, LogIn, Mail, MapPin, User as UserIcon, Calendar, CheckCircle2, ChevronDown } from "lucide-react";
import { generateAuthRoast } from "@/app/actions/acts";

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--brand-primary)]/20 rounded-full blur-2xl animate-pulse" />
          <img 
            src="/logo-neon.png" 
            className="w-20 h-20 animate-[spin_4s_linear_infinite] relative z-10" 
            alt="Loading..." 
          />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-primary)] animate-pulse">
          Summoning the Oracle...
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roast, setRoast] = useState<{ roast: string, toggleText: string, forgotPasswordText?: string, popupRoasts?: Array<{emoji: string, text: string}> } | null>(null);
  const [activePopup, setActivePopup] = useState<{ emoji: string, text: string, x: number, y: number, rotation: number, scale: number } | null>(null);
  const [roastsEnabled, setRoastsEnabled] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const refToken = searchParams.get("refToken");

  useEffect(() => {
    if (refCode || refToken) {
      setMode("signup");
    }
  }, [refCode, refToken]);

  useEffect(() => {
    const checkRoastPref = () => {
      setRoastsEnabled(localStorage.getItem('roastsEnabled') !== 'false');
    };
    checkRoastPref();
    window.addEventListener('roastToggle', checkRoastPref);
    return () => window.removeEventListener('roastToggle', checkRoastPref);
  }, []);

  useEffect(() => {
    setRoast(null);
    if (roastsEnabled) {
      generateAuthRoast(mode).then(setRoast).catch(console.error);
    }
  }, [mode, roastsEnabled]);

  useEffect(() => {
    if (!roastsEnabled || !roast?.popupRoasts?.length) return;
    
    const interval = setInterval(() => {
      // 40% chance to jump scare every 4 seconds
      if (Math.random() > 0.6) {
        const randomRoast = roast.popupRoasts![Math.floor(Math.random() * roast.popupRoasts!.length)];
        
        // Spawn on the left (15-25%) or right (75-85%) sides to avoid overlapping the center form and the edges
        const isLeftSide = Math.random() > 0.5;
        const x = isLeftSide ? Math.random() * 10 + 15 : Math.random() * 10 + 75;
        
        // Spawn vertically (20-80%) to avoid cutting off top/bottom
        const y = Math.random() * 60 + 20;
        
        const rotation = Math.random() * 60 - 30; // -30 to +30 deg
        const scale = Math.random() * 0.5 + 0.8; // 0.8 to 1.3x scale
        
        setActivePopup({ ...randomRoast, x, y, rotation, scale });
        
        setTimeout(() => {
          setActivePopup(null);
        }, 2000); // hide after 2s
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [roast]);

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
          body: JSON.stringify({
            ...formData,
            refCode: refCode || undefined,
            refToken: refToken || undefined
          })
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
    <main className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Random Popup Roast */}
      {activePopup && (
        <div 
          className="fixed z-50 pointer-events-none animate-in zoom-in spin-in duration-300 flex flex-col items-center justify-center drop-shadow-2xl"
          style={{ 
            left: `${activePopup.x}%`, 
            top: `${activePopup.y}%`, 
            transform: `translate(-50%, -50%) rotate(${activePopup.rotation}deg) scale(${activePopup.scale})` 
          }}
        >
          <div className="text-8xl md:text-9xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce">{activePopup.emoji}</div>
          <div className="mt-4 bg-[var(--bg-card)] text-[var(--text-main)] px-6 py-3 rounded-2xl border-4 border-[var(--brand-primary)] font-black text-xl md:text-2xl whitespace-nowrap text-center uppercase tracking-widest rotate-3 shadow-[0_0_30px_var(--brand-primary)]">
            {activePopup.text}
          </div>
        </div>
      )}

      <Navbar />
      
      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        <div className="card-glass p-10 md:p-14 text-center relative overflow-hidden">
          {/* Status Notifications */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in fade-in slide-in-from-top-2 break-words">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-8 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold animate-in fade-in slide-in-from-top-2 break-words">
              {success}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl mb-8 max-w-xs mx-auto hidden">
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
          
          <div className="min-h-[80px] mb-10 flex items-center justify-center">
            {!roastsEnabled ? (
              <p className="text-[var(--text-muted)] text-lg font-medium max-w-xl mx-auto leading-relaxed">
                {mode === "login" ? "Welcome back. Please enter your credentials." : "Create an account to continue."}
              </p>
            ) : roast ? (
              <p className="text-[var(--brand-accent)] text-lg font-bold max-w-xl mx-auto leading-relaxed animate-in zoom-in duration-500">
                {roast.roast}
              </p>
            ) : (
              <p className="text-[var(--text-muted)] text-sm font-medium max-w-xl mx-auto animate-pulse flex items-center gap-2 justify-center">
                <Sparkles size={16} /> The Oracle is judging you...
              </p>
            )}
          </div>
          
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
              {mode === "login" && (
                <div className="flex justify-end px-2">
                  <button 
                    type="button" 
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-xs font-bold text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    {roastsEnabled && roast?.forgotPasswordText ? roast.forgotPasswordText : "Forgot Password?"}
                  </button>
                </div>
              )}
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
              className="btn-primary w-full py-7 text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl hover:scale-[1.01] transition-all mt-4"
            >
              {loading ? "Magic in progress..." : mode === "login" ? "Enter the Tent" : "Join the Circus"}
              {!loading && <ArrowRight size={28} />}
            </button>

            <div className="pt-6 border-t border-[var(--border-color)] text-center">
              <button 
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors underline decoration-dashed underline-offset-4"
              >
                {!roastsEnabled 
                  ? (mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in")
                  : (roast ? roast.toggleText : (mode === "login" ? "Actually, I don't have an account... help 🤡" : "Wait, I already have an account! Take me back! 🏃💨"))
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

