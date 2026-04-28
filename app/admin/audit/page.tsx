import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Shield, User as UserIcon, Ticket, Cpu, Key, Mail, Trash2, Edit2, Plus } from "lucide-react";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const getActionIcon = (action: string) => {
    if (action.includes("USER")) return <UserIcon size={16} />;
    if (action.includes("SUBSCRIPTION")) return <Ticket size={16} />;
    if (action.includes("ORACLE") || action.includes("AI")) return <Cpu size={16} />;
    if (action.includes("PASSWORD")) return <Key size={16} />;
    if (action.includes("EMAIL")) return <Mail size={16} />;
    return <Shield size={16} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes("DELETED")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (action.includes("CREATED")) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (action.includes("UPDATED") || action.includes("SET")) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (action.includes("REQUEST")) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/20";
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">Audit Logs</h1>
        <p className="text-[var(--text-muted)] font-medium">The Oracle remembers everything. Review administrative actions.</p>
      </div>

      <div className="card-glass overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)]">
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] font-medium">
                  No logs found. The circus has been surprisingly well-behaved.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-surface)]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center font-black text-xs text-purple-500">
                        {log.adminName?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <div className="text-sm font-bold">{log.adminName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--text-main)] max-w-sm truncate" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.targetName ? (
                      <span className="text-xs font-bold px-2 py-1 bg-[var(--bg)] border border-[var(--border-color)] rounded-md">
                        {log.targetName}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xs font-bold text-[var(--text-muted)]">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
