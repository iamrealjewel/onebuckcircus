import { prisma } from "@/lib/prisma";
import SubscriptionManager from "@/components/admin/SubscriptionManager";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { priceMonthly: 'asc' }
  });

  return (
    <div className="animate-fade-in">
      <SubscriptionManager initialSubscriptions={subscriptions} />
      
      <div className="card-glass p-8 bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/20 mt-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h4 className="font-black mb-1 text-lg">Business Logic Overview</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Subscription changes are processed instantly. If a user downgrades, their additional acts remain locked until the next billing cycle. 
              If they upgrade, they get immediate access to more slots or all acts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
