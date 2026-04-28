import { prisma } from "@/lib/prisma";
import { Search, Filter } from "lucide-react";
import UserTable from "@/components/admin/UserTable";

export default async function AdminRingmastersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    include: { subscription: true },
    orderBy: { createdAt: 'desc' }
  });

  const subscriptions = await prisma.subscription.findMany();

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Ringmasters</h1>
          <p className="text-purple-400 font-medium">Manage other administrators and system operators.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ringmasters..." 
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-10 py-3 text-sm focus:border-purple-500 outline-none w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          </div>
          <button className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <UserTable initialUsers={users} subscriptions={subscriptions} canEdit={true} />
      </div>
    </div>
  );
}
