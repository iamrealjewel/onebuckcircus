"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Users, Ticket, Cpu, BarChart3, Settings, LogOut, ChevronRight, Palette } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const themes: { id: "neon" | "midnight" | "sunset" | "emerald"; label: string; color: string }[] = [
    { id: "neon", label: "Neon", color: "#ff3cac" },
    { id: "midnight", label: "Midnight", color: "#00d4ff" },
    { id: "sunset", label: "Sunset", color: "#ff6b35" },
    { id: "emerald", label: "Emerald", color: "#00f5a0" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col p-8 sticky top-0 h-screen z-50 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/admin" className="flex items-center gap-3 font-black text-2xl mb-12 group">
            <span className="text-3xl group-hover:rotate-12 transition-transform">🎪</span>
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
            <SidebarLink href="/admin/subscriptions" icon={<Ticket size={20} />} label="Ticket Booth" active={pathname.startsWith("/admin/subscriptions")} />
            <SidebarLink href="/admin/ai" icon={<Cpu size={20} />} label="The Oracle" active={pathname.startsWith("/admin/ai")} />
            
            <div className="pt-6 pb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-4">System</span>
            </div>
            <SidebarLink href="/admin/settings" icon={<Settings size={20} />} label="Tent Settings" active={pathname === "/admin/settings"} />
          </nav>

          {/* Theme Switcher inside Sidebar */}
          <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 mb-4 ml-4">
              <Palette size={14} className="text-[var(--text-muted)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Ambience</span>
            </div>
            <div className="grid grid-cols-4 gap-2 px-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${theme === t.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 shadow-lg' : 'border-transparent hover:bg-[var(--bg-surface)]'}`}
                  title={t.label}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400/70 hover:text-red-500 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
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
        
        <div className="relative z-10 max-w-7xl mx-auto">
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
      className={`flex items-center justify-between group px-5 py-4 rounded-2xl text-sm font-bold transition-all relative overflow-hidden ${
        active 
          ? 'bg-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary)]/20' 
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
