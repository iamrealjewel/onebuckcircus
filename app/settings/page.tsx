"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { changeUserPassword, requestSelfEmailChange } from "@/app/actions/user";
import { Lock, ArrowRight, CheckCircle, Mail } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("password");
    setPasswordMessage(null);

    try {
      await changeUserPassword(password);
      setPasswordMessage({ type: "success", text: "Password successfully updated!" });
      setPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to update password." });
    }

    setLoading(null);
  };

  const handleEmailRequest = async () => {
    setLoading("email");
    setEmailMessage(null);

    try {
      await requestSelfEmailChange();
      setEmailMessage({ type: "success", text: "A secure scroll has been dispatched! You are being logged out for security..." });
      
      setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, 3000);
    } catch (err: any) {
      setEmailMessage({ type: "error", text: err.message || "Failed to dispatch scroll." });
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3 tracking-tighter">Account Settings</h1>
          <p className="text-[var(--text-muted)] font-medium">Update your circus credentials.</p>
        </div>

        <div className="card-glass p-8">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Lock size={20} className="text-[var(--brand-primary)]" /> Change Password
          </h2>

          {passwordMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${passwordMessage.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
              {passwordMessage.type === "success" && <CheckCircle size={18} />}
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter new password"
                  className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-12 py-4 focus:border-[var(--brand-primary)] outline-none transition-all"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading !== null || password.length < 6}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading === "password" ? "Updating..." : "Update Password"}
              {loading !== "password" && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="card-glass p-8 mt-8">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Mail size={20} className="text-purple-500" /> Change Email
          </h2>

          <div className="mb-6 p-4 rounded-xl text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Current Identity: {session?.user?.email || "Loading..."}
          </div>

          {emailMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${emailMessage.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
              {emailMessage.type === "success" && <CheckCircle size={18} />}
              {emailMessage.text}
            </div>
          )}

          <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
            Want to flee and start a new life? Click the button below. We'll send a secure token to your <strong>current</strong> email address to verify it's really you before letting you switch.
          </p>

          <button 
            onClick={handleEmailRequest}
            disabled={loading !== null}
            className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 !bg-purple-500 !border-purple-500 hover:!bg-purple-600 shadow-lg shadow-purple-500/20"
          >
            {loading === "email" ? "Dispatching..." : "Request Email Change"}
            {loading !== "email" && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </main>
  );
}
