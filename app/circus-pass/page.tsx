"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Check, Star, Zap, Flame, ShieldAlert, Calendar, CreditCard } from "lucide-react";

const tiers = [
  {
    id: "CHAOS",
    name: "Chaos",
    price: { monthly: 1, yearly: 10 },
    acts: 3,
    color: "var(--brand-primary)",
    icon: <Flame size={24} />,
    description: "For those who like a controlled dose of madness.",
    features: ["Unlimited use of 3 selected acts", "Basic Support", "Standard Oracle access"]
  },
  {
    id: "DESTRUCTION",
    name: "Destruction",
    price: { monthly: 2, yearly: 20 },
    acts: 5,
    color: "var(--brand-secondary)",
    icon: <Zap size={24} />,
    popular: true,
    description: "When just a little chaos isn't enough.",
    features: ["Unlimited use of 5 selected acts", "Priority Support", "Faster Oracle response"]
  },
  {
    id: "ANNIHILATION",
    name: "Annihilation",
    price: { monthly: 5, yearly: 50 },
    acts: "All",
    color: "var(--brand-accent)",
    icon: <ShieldAlert size={24} />,
    description: "The ultimate pass. Absolute power. No limits.",
    features: ["All acts unlocked instantly", "VIP support", "Premium AI models", "Early access to new acts"]
  }
];

export default function CircusPassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    if (status === "unauthenticated") {
      router.push("/auth?callbackUrl=/circus-pass");
      return;
    }

    setLoading(tierId);
    try {
      // In a real app, this would redirect to Stripe
      // For this scenario, we'll call our API to update the sub
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tier: tierId, 
          billingCycle 
        }),
      });

      if (res.ok) {
        if (tierId === "ANNIHILATION") {
          router.push("/");
        } else {
          router.push("/select-acts"); // New page to pick their apps
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-6xl flex flex-col items-center">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">The Main Attraction</h1>
          <p className="text-[var(--text-muted)] text-xl max-w-2xl mx-auto font-medium">
            Choose your level of participation in the beautiful chaos.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center p-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === "monthly" ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === "yearly" ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              Yearly <span className="ml-1 text-[8px] opacity-70">(2 Months Free)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {tiers.map((tier) => (
            <div 
              key={tier.id} 
              className={`card-glass p-10 flex flex-col h-full relative overflow-hidden transition-all hover:scale-[1.02] ${tier.popular ? 'border-[var(--brand-primary)]/50 bg-gradient-to-br from-[var(--bg-card)] to-[var(--brand-primary)]/5 shadow-2xl' : ''}`}
            >
              {tier.popular && (
                <div className="absolute top-5 right-5 px-3 py-1 bg-[var(--brand-primary)] text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg z-10">
                  <Star size={10} fill="currentColor" /> Recommended
                </div>
              )}

              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-8 border border-[var(--border-color)] text-[var(--brand-primary)]" style={{ color: tier.color }}>
                {tier.icon}
              </div>

              <h2 className="text-3xl font-black mb-2">{tier.name}</h2>
              <p className="text-xs text-[var(--text-muted)] font-bold mb-8 leading-relaxed">{tier.description}</p>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">${billingCycle === "monthly" ? tier.price.monthly : tier.price.yearly}</span>
                  <span className="text-[var(--text-muted)] font-bold">{billingCycle === "monthly" ? '/mo' : '/yr'}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-12 flex-grow">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm font-bold">
                    <Check size={16} className="text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(tier.id)}
                disabled={!!loading}
                className={`w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${tier.popular ? 'btn-primary' : 'btn-outline'}`}
              >
                {loading === tier.id ? 'Securing Seat...' : `Start ${tier.name}`}
                <CreditCard size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl text-center md:text-left">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
              <Calendar className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <h4 className="font-black text-lg mb-2">30-Day Commitment</h4>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                Chaos and Destruction passes lock your act selection for 30 days. Choose your madness wisely.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
              <Star className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <h4 className="font-black text-lg mb-2">Upgrade Anytime</h4>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                Want to expand the destruction? Upgrade to Annihilation instantly and we'll prorate your existing pass.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
