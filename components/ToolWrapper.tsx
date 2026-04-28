"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Ticket, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ToolWrapper({ 
  children, 
  appId 
}: { 
  children: React.ReactNode; 
  appId: string 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--bg)]">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--brand-primary)]/20 rounded-full blur-2xl animate-pulse" />
          <img 
            src="/logo-neon.png" 
            className="w-20 h-20 animate-[spin_4s_linear_infinite] relative z-10" 
            alt="Loading..." 
          />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-primary)] animate-pulse">
          Consulting the Oracle...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center">
        <Navbar />
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-[var(--bg-card)] rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[var(--border-color)]">
            <Lock className="text-[var(--text-muted)]" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-4">Tickets, Please!</h1>
          <p className="text-[var(--text-muted)] mb-8 font-medium">You need to be logged in to access this act.</p>
          <Link href="/auth" className="btn-primary w-full py-4 flex items-center justify-center gap-3">
            Enter the Circus <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    );
  }

  const user = session?.user as any;
  const hasAccess = 
    user?.subscriptionType === "ANNIHILATION" || 
    (user?.selectedApps?.includes(appId));

  if (!hasAccess) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center">
        <Navbar />
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-[var(--brand-primary)]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[var(--brand-primary)]/30">
            <Ticket className="text-[var(--brand-primary)]" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-4">Access Denied</h1>
          <p className="text-[var(--text-muted)] mb-8 font-medium">
            {user?.subscriptionType === "CHAOS" || user?.subscriptionType === "DESTRUCTION"
              ? "This act is not included in your current selection." 
              : "You need a Circus Pass to access this act."}
          </p>
          <Link href="/circus-pass" className="btn-primary w-full py-4 flex items-center justify-center gap-3">
            {user?.subscriptionType === "NONE" ? "Get a Ticket" : "Upgrade Ticket"} <ArrowRight size={20} />
          </Link>
          <Link href="/" className="block mt-6 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors uppercase tracking-widest">
            Back to Front Page
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
