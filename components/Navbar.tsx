"use client";

import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogOut, User as UserIcon, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const themes: { id: "neon" | "midnight" | "sunset" | "emerald"; label: string; color: string }[] = [
    { id: "neon", label: "Neon", color: "#ff3cac" },
    { id: "midnight", label: "Midnight", color: "#00d4ff" },
    { id: "sunset", label: "Sunset", color: "#ff6b35" },
    { id: "emerald", label: "Emerald", color: "#00f5a0" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl group">
          <span className="text-2xl group-hover:rotate-12 transition-transform">🎪</span>
          <span className="gradient-text">One Buck Circus</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#tools" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">The Acts</Link>
          <Link href="/circus-pass" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">The Pass</Link>
          
          {isAdmin && (
            <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-400/5 border border-purple-400/20">
              <Shield size={12} /> Admin
            </Link>
          )}

          <div className="flex items-center gap-2 border-l border-[var(--border-color)] pl-6">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${theme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: t.color }}
                title={t.label}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 ml-2">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-[var(--text-main)] leading-none mb-1">{session.user?.name}</span>
                  <span className="text-[8px] font-black text-[var(--brand-accent)] leading-none uppercase tracking-tighter">
                    {(session.user as any).subscriptionType === "NONE" ? "Free Guest" : (session.user as any).subscriptionType.replace("_", " ")}
                  </span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center hover:border-[var(--brand-primary)] transition-colors"
                >
                  <LogOut size={16} className="text-[var(--text-muted)]" />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-[10px] uppercase tracking-widest">
                Enter the Circus
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-[var(--text-main)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[var(--bg-surface)] border-b border-[var(--border-color)] p-6 flex flex-col gap-6 animate-fade-in shadow-2xl">
          <Link href="/#tools" onClick={() => setIsOpen(false)} className="text-lg font-black tracking-tighter">The Acts</Link>
          <Link href="/circus-pass" onClick={() => setIsOpen(false)} className="text-lg font-black tracking-tighter">The Pass</Link>
          
          {isAdmin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-black tracking-tighter text-purple-400 flex items-center gap-2">
              <Shield size={20} /> Control Center
            </Link>
          )}

          <div className="flex gap-4 border-y border-[var(--border-color)] py-6">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setIsOpen(false); }}
                className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-2 ${theme === t.id ? 'border-white bg-[var(--bg-card)]' : 'border-[var(--border-color)] bg-[var(--bg-card)]/50'}`}
              >
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
              </button>
            ))}
          </div>

          {session ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center">
                  <UserIcon size={20} className="text-[var(--brand-primary)]" />
                </div>
                <div>
                  <div className="text-sm font-black">{session.user?.name}</div>
                  <div className="text-[10px] font-bold text-[var(--brand-accent)] uppercase">
                    {(session.user as any).subscriptionType.replace("_", " ")}
                  </div>
                </div>
              </div>
              <button onClick={() => signOut()} className="p-2 text-[var(--text-muted)]">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/auth" onClick={() => setIsOpen(false)} className="btn-primary text-center text-lg py-4">
              Enter the Circus
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
