import { prisma } from "@/lib/prisma";
import { Users, Ticket, Cpu, TrendingUp } from "lucide-react";

export default async function AdminPage() {
  const userCount = await prisma.user.count();
  const subCount = await prisma.user.count({ where: { NOT: { subscriptionId: null } } });
  const activeModels = await prisma.aIModel.count({ where: { isActive: true } });
  
  const stats = [
    { label: "Total Performers", value: userCount, icon: <Users />, color: "text-blue-500" },
    { label: "Active Tickets", value: subCount, icon: <Ticket />, color: "text-green-500" },
    { label: "AI Oracles", value: activeModels, icon: <Cpu />, color: "text-purple-500" },
    { label: "Monthly Revenue", value: `$${(subCount * 1.5).toFixed(2)}`, icon: <TrendingUp />, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">Grand Overview</h1>
        <p className="text-[var(--text-muted)] font-medium">Monitoring the beautiful chaos of One Buck Circus.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-glass p-6 flex items-center gap-6 border-b-4 border-b-transparent hover:border-b-[var(--brand-primary)] transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center ${stat.color} border border-[var(--border-color)]`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{stat.label}</div>
              <div className="text-3xl font-black">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-glass p-8">
          <h2 className="text-xl font-black mb-6">Recent Registrations</h2>
          <div className="space-y-4">
            {(await prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } })).map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg)] border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center font-black text-xs">
                    {u.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{u.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{u.email}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-8">
          <h2 className="text-xl font-black mb-6">Subscription Distribution</h2>
          <div className="space-y-6">
            {['CHAOS', 'DESTRUCTION', 'ANNIHILATION'].map(async (tier) => {
              const count = await prisma.user.count({ where: { subscription: { tier } } });
              const total = Math.max(subCount, 1);
              const percent = (count / total) * 100;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span>{tier}</span>
                    <span>{count} Users ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand-primary)] transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
