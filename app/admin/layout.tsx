"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Users, Ticket, Cpu, BarChart3, Settings, LogOut, ChevronRight, Palette, Shield, ScrollText, Megaphone } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes: { id: string; label: string; color: string }[] = [
    { id: "neon", label: "Neon", color: "#ff3cac" },
    { id: "midnight", label: "Midnight", color: "#00d4ff" },
    { id: "sunset", label: "Sunset", color: "#ff6b35" },
    { id: "emerald", label: "Emerald", color: "#00f5a0" },
    { id: "cyberpunk", label: "Cyberpunk", color: "#fcee0a" },
    { id: "blood-moon", label: "Blood Moon", color: "#ff0000" },
    { id: "daylight", label: "Daylight", color: "#3b82f6" },
    { id: "cotton-candy", label: "Cotton", color: "#ff7eb3" }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col p-8 sticky top-0 h-screen z-50 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/admin" className="flex items-center gap-3 font-black text-2xl mb-12 group">
            <img 
              src={["neon", "midnight", "sunset", "emerald"].includes(theme) ? `/logo-${theme}.png` : "/logo-neon.png"} 
              alt="Circus Admin Logo" 
              className="w-10 h-10 group-hover:rotate-12 transition-transform"
              style={{ filter: `drop-shadow(0 0 8px var(--brand-primary))` }}
            />
            <span className="text-3xl group-hover:rotate-12 transition-transform hidden">🎪</span>
            <div className="flex flex-col">
              <span className="gradient-text leading-none">CIRCUS</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)]">Control Center</span>
            </div>
          </Link>

          <nav className="space-y-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <SidebarLink href="/admin" icon={<BarChart3 size={20} />} label="Overview" active={pathname === "/admin"} />
            
            <div className="pt-6 pb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-4">Management</span>
            </div>
            <SidebarLink href="/admin/users" icon={<Users size={20} />} label="Performers" active={pathname.startsWith("/admin/users")} />
            <SidebarLink href="/admin/admins" icon={<Shield size={20} />} label="Ringmasters" active={pathname.startsWith("/admin/admins")} />
            <SidebarLink href="/admin/subscriptions" icon={<Ticket size={20} />} label="Ticket Booth" active={pathname.startsWith("/admin/subscriptions")} />
            <SidebarLink href="/admin/ai" icon={<Cpu size={20} />} label="The Oracle" active={pathname.startsWith("/admin/ai")} />
            <SidebarLink href="/admin/campaigns" icon={<Megaphone size={20} />} label="Campaigns" active={pathname.startsWith("/admin/campaigns")} />
            
            <div className="pt-6 pb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-4">System</span>
            </div>
            <SidebarLink href="/admin/audit" icon={<ScrollText size={20} />} label="Audit Logs" active={pathname.startsWith("/admin/audit")} />
            <SidebarLink href="/admin/settings" icon={<Settings size={20} />} label="Tent Settings" active={pathname === "/admin/settings"} />
          </nav>

          {/* Theme Dropdown Grid */}
          <div className="mt-8 pt-8 border-t border-[var(--border-color)] relative" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-4 ml-4">
              <Palette size={14} className="text-[var(--text-muted)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Ambience</span>
            </div>
            
            <button 
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 flex items-center justify-between text-xs font-bold hover:bg-[var(--bg-surface)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: themes.find(t => t.id === theme)?.color || 'var(--brand-primary)' }} 
                />
                <span className="capitalize">{theme.replace("-", " ")}</span>
              </div>
              <ChevronRight size={14} className={`text-[var(--text-muted)] transition-transform ${isThemeOpen ? 'rotate-90' : ''}`} />
            </button>

            {isThemeOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-[60] backdrop-blur-xl">
                <div className="grid grid-cols-4 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setIsThemeOpen(false); }}
                      className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center hover:scale-110 ${theme === t.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-transparent hover:bg-[var(--bg-surface)]'}`}
                      title={t.label}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8">
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-between gap-3 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400/70 hover:text-red-500 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
            >
              <span className="flex items-center gap-3">
                <LogOut size={16} /> Close Tent
              </span>
              <ChevronRight size={14} className="opacity-50" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-16 overflow-y-auto relative bg-[var(--bg)]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-main) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 w-full px-6 lg:px-12 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-between group px-5 py-2.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden ${
        active 
          ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] shadow-xl shadow-[var(--brand-primary)]/20' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
      }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
        {label}
      </div>
      {active && <ChevronRight size={16} className="relative z-10" />}
      
      {/* Active background glow */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
      )}
    </Link>
  );
}
