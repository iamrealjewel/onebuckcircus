"use client";

import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User as UserIcon, Shield, Settings, Ghost, Palette, Moon, Sun } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [roastsOn, setRoastsOn] = useState(true);

  useEffect(() => {
    setRoastsOn(localStorage.getItem('roastsEnabled') !== 'false');
  }, []);

  const toggleRoasts = () => {
    const newVal = !roastsOn;
    setRoastsOn(newVal);
    localStorage.setItem('roastsEnabled', String(newVal));
    window.dispatchEvent(new Event('roastToggle'));
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const allThemes: { id: any; label: string; colors: string[] }[] = [
    { id: "neon", label: "Neon", colors: ["#ff3cac", "#bf5af2"] },
    { id: "midnight", label: "Midnight", colors: ["#00d4ff", "#4f8eff"] },
    { id: "sunset", label: "Sunset", colors: ["#ff6b35", "#ff3c3c"] },
    { id: "emerald", label: "Emerald", colors: ["#00f5a0", "#00d4ff"] },
    { id: "cyberpunk", label: "Cyberpunk", colors: ["#fcee0a", "#ff003c"] },
    { id: "blood-moon", label: "Blood Moon", colors: ["#ff0000", "#8b0000"] },
    { id: "daylight", label: "Daylight", colors: ["#f3f4f6", "#3b82f6"] },
    { id: "cotton-candy", label: "Cotton", colors: ["#fff5f8", "#ff7eb3"] }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="w-full mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl group">
          <img 
            src={["neon", "midnight", "sunset", "emerald"].includes(theme) ? `/logo-${theme}.png` : "/logo-neon.png"} 
            alt="One Buck Circus Logo" 
            className="w-8 h-8 group-hover:rotate-12 transition-transform"
          />
          <span className="gradient-text">One Buck Circus</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#tools" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">The Acts</Link>
          <Link href="/circus-pass" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">The Pass</Link>
          
          {session && (
            <Link href="/friendzone" className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1">
              Friendzone
            </Link>
          )}
          
          {isAdmin && (
            <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-400/5 border border-purple-400/20">
              <Shield size={12} /> Admin
            </Link>
          )}

          <div className="flex items-center gap-2 border-l border-[var(--border-color)] pl-6">
            <button 
              onClick={toggleRoasts} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-colors mr-2 ${roastsOn ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--bg-surface)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)]'}`}
              title={roastsOn ? "Disable AI Roasts" : "Enable AI Roasts"}
            >
              <Ghost size={14} />
              <span className="hidden md:inline">{roastsOn ? "Roasts On" : "Roasts Off"}</span>
            </button>

            {/* Desktop Theme Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)} 
                className="w-8 h-8 rounded-full border-2 border-[var(--brand-primary)] flex items-center justify-center bg-[var(--bg-card)] hover:scale-110 transition-transform"
                title="Select Theme"
              >
                <Palette size={14} className="text-[var(--brand-primary)]" />
              </button>
              
              {isThemeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsThemeDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 pl-1">
                      <Sun size={12} /> Light & Dark <Moon size={12} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {allThemes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setIsThemeDropdownOpen(false); }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${theme === t.id ? 'bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/50' : 'bg-[var(--bg)] border border-[var(--border-color)] hover:border-[var(--brand-primary)]/50'}`}
                        >
                          <div className="w-full h-8 rounded-lg shadow-inner" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-main)] truncate w-full text-center">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 ml-2">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-[var(--text-main)] leading-none mb-1">{session.user?.name}</span>
                  <span className="text-[8px] font-black text-[var(--brand-accent)] leading-none uppercase tracking-tighter">
                    {((session.user as any).subscriptionType || "NONE") === "NONE" ? "Free Guest" : ((session.user as any).subscriptionType || "").replace("_", " ")}
                  </span>
                </div>
                <Link 
                  href="/settings"
                  className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
                  title="Account Settings"
                >
                  <Settings size={16} className="text-inherit" />
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} className="text-inherit" />
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
          
          {session && (
            <Link href="/friendzone" onClick={() => setIsOpen(false)} className="text-lg font-black tracking-tighter text-[var(--brand-primary)]">Friendzone</Link>
          )}
          
          {isAdmin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-black tracking-tighter text-purple-400 flex items-center gap-2">
              <Shield size={20} /> Control Center
            </Link>
          )}

          <div className="flex flex-col gap-4 border-y border-[var(--border-color)] py-6">
            <button 
              onClick={toggleRoasts} 
              className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-colors w-full ${roastsOn ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--bg-surface)] hover:border-white'}`}
            >
              <Ghost size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{roastsOn ? "AI Roasts Active" : "AI Roasts Disabled"}</span>
            </button>

            <div className="pt-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <Palette size={12} /> Select Theme
              </div>
              <div className="grid grid-cols-2 gap-3">
                {allThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setIsOpen(false); }}
                    className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${theme === t.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-[var(--border-color)] bg-[var(--bg-card)]'}`}
                  >
                    <div className="w-full h-6 rounded-md shadow-inner" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
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
              <div className="flex gap-2">
                <Link href="/settings" onClick={() => setIsOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)]">
                  <Settings size={20} />
                </Link>
                <button onClick={() => signOut()} className="p-2 text-[var(--text-muted)] hover:text-red-500">
                  <LogOut size={20} />
                </button>
              </div>
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
