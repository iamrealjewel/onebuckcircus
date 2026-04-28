"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Check, Star, Zap, Dices, Crown, Calendar, CreditCard, WandSparkles } from "lucide-react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

const tiers = [
  {
    id: "CHAOS",
    name: "Chaos",
    price: { monthly: 1, yearly: 10 },
    acts: 3,
    color: "#a3e635", // Lime Green
    icon: <Dices size={24} />,
    description: "For those who like a controlled dose of madness.",
    features: ["Unlimited use of 3 selected acts", "Basic Support", "Standard Oracle access"],
    buttonStyle: "bg-lime-500/10 text-lime-400 border border-lime-500/30 hover:bg-lime-500 hover:text-black shadow-lg shadow-lime-500/10",
    modalIcon: "🎲",
    modalMessage: "A little chaos never hurt anyone... much. Roll the dice?"
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
    features: ["Unlimited use of 5 selected acts", "Priority Support", "Faster Oracle response"],
    buttonStyle: "bg-rose-500 text-white border border-rose-500 hover:bg-rose-600 shadow-[0_0_30px_rgba(243,28,63,0.4)]",
    modalIcon: "🧨",
    modalMessage: "You're asking for trouble. And we're going to give it to you. Ignite the Destruction?"
  },
  {
    id: "ANNIHILATION",
    name: "Annihilation",
    price: { monthly: 5, yearly: 50 },
    acts: "All",
    color: "#facc15", // Premium Gold
    icon: <Crown size={24} />,
    description: "The ultimate pass. Absolute power. No limits.",
    features: ["All acts unlocked instantly", "VIP support", "Premium AI models", "Early access to new acts"],
    buttonStyle: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black shadow-lg shadow-yellow-500/10",
    modalIcon: "👑",
    modalMessage: "Absolute power corrupts absolutely. Welcome to the top of the food chain. Claim the Crown?"
  }
];

export default function CircusPassPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const { showAlert } = useCircusDialog();

  // Redirect admin users
  if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
    router.push("/admin");
  }

  const getTierLevel = (tierId: string) => {
    if (tierId === "CHAOS") return 1;
    if (tierId === "DESTRUCTION") return 2;
    if (tierId === "ANNIHILATION") return 3;
    return 0;
  };

  const getTierPrice = (tierId: string, cycle: "monthly" | "yearly") => {
    const t = tiers.find(t => t.id === tierId);
    return t ? t.price[cycle] : 0;
  };

  const initiateSubscribe = (tier: any) => {
    if (status === "unauthenticated") {
      router.push("/auth?callbackUrl=/circus-pass");
      return;
    }

    const user = session?.user as any;
    let isUpgrade = false;
    let upgradeCost = 0;

    if (user?.subscriptionType && user.subscriptionType !== "NONE" && user.subscribedAt) {
      if (user.subscriptionType === tier.id) {
        showAlert(`User is trying to buy the ${tier.name} pass but they already have it active. Roast them for trying to buy the same ticket twice.`);
        return;
      }

      const currentLevel = getTierLevel(user.subscriptionType);
      const newLevel = getTierLevel(tier.id);
      isUpgrade = newLevel > currentLevel;

      if (isUpgrade) {
        const currentPrice = getTierPrice(user.subscriptionType, billingCycle);
        const newPrice = tier.price[billingCycle];
        upgradeCost = newPrice - currentPrice;
      } else {
        const subDate = new Date(user.subscribedAt);
        const now = new Date();
        const diffTime = now.getTime() - subDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays < 30) {
          showAlert(`User is trying to downgrade or switch their circus pass to ${tier.name}, but they signed a blood pact ${diffDays} days ago and still have ${30 - diffDays} days left. Tell them the Oracle demands a 30-day commitment.`);
          return;
        }
      }
    }

    setSelectedTier({ ...tier, isUpgrade, upgradeCost });
  };

  const confirmSubscribe = async () => {
    if (!selectedTier) return;
    setLoading(selectedTier.id);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tier: selectedTier.id, 
          billingCycle 
        }),
      });

      if (res.ok) {
        await update(); // Force session refresh so the UI knows the new tier immediately
        if (selectedTier.id === "ANNIHILATION") {
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
      
      <div className="w-full px-6 lg:px-12 flex flex-col items-center">
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
          {tiers.map((tier) => {
            const isCurrentPlan = (session?.user as any)?.subscriptionType === tier.id;

            return (
            <div 
              key={tier.id} 
              className={`card-glass p-10 flex flex-col h-full relative overflow-hidden transition-all hover:scale-[1.02] ${tier.popular && !isCurrentPlan ? 'border-rose-500/50 bg-gradient-to-br from-[var(--bg-card)] to-rose-500/5 shadow-2xl' : ''}`}
              style={isCurrentPlan ? { borderColor: tier.color, backgroundColor: `${tier.color}15`, boxShadow: `0 0 40px ${tier.color}30` } : {}}
            >
              {isCurrentPlan && (
                <div className="absolute top-5 left-5 px-3 py-1 bg-[var(--bg)] text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg z-20 border" style={{ borderColor: tier.color, color: tier.color }}>
                  <Check size={12} /> Current Pass
                </div>
              )}

              {tier.popular && !isCurrentPlan && (
                <div className="absolute top-5 right-5 px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg z-10">
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
                onClick={() => initiateSubscribe(tier)}
                disabled={!!loading || isCurrentPlan}
                className={`w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isCurrentPlan ? 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-2 border-[var(--border-color)] opacity-50 cursor-not-allowed' : tier.buttonStyle}`}
              >
                {isCurrentPlan ? 'Active Pass' : loading === tier.id ? 'Securing Seat...' : `Start ${tier.name}`}
                {!isCurrentPlan && <CreditCard size={20} />}
              </button>
            </div>
          )})}
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

      {/* Confirmation Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && setSelectedTier(null)} />
          <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-300 text-center">
            <div className={`flex justify-center mb-6 ${loading ? 'animate-[spin_3s_linear_infinite]' : 'animate-bounce'}`}>
              {loading ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--brand-primary)]/40 rounded-full blur-xl animate-pulse" />
                  <WandSparkles size={64} className="text-[var(--brand-primary)] relative z-10" />
                </div>
              ) : (
                <span className="text-7xl">{selectedTier.modalIcon}</span>
              )}
            </div>
            <h2 className="text-3xl font-black mb-4 text-white">
              {loading ? 'Summoning...' : selectedTier.isUpgrade ? `Upgrade to ${selectedTier.name}?` : `Choose ${selectedTier.name}?`}
            </h2>
            <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-10 text-lg">
              {loading 
                ? 'Please wait while the Oracle records your pact...' 
                : selectedTier.isUpgrade 
                  ? `Your validity remains the same! You only need to pay the prorated difference of $${selectedTier.upgradeCost} for the remaining charge. Ready to unleash more madness?` 
                  : selectedTier.modalMessage}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedTier(null)} 
                disabled={!!loading}
                className="flex-1 py-4 btn-outline rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-30"
              >
                Back Away Slowly
              </button>
              <button 
                onClick={confirmSubscribe} 
                disabled={!!loading}
                className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 ${selectedTier.buttonStyle}`}
              >
                {loading ? 'Committing...' : "Yes, Let's Go"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
