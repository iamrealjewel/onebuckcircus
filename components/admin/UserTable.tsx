"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Shield, User as UserIcon, Trash2, Edit2, X } from "lucide-react";

export default function UserTable({ initialUsers, subscriptions }: { initialUsers: any[], subscriptions: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to banish this performer?")) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  const handleUpdate = async (id: string, data: any) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, ...updated } : u));
        setEditingUser(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  return (
    <div className="card-glass overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--bg-surface)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)]">
            <th className="px-6 py-4">Performer</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Ticket (Sub)</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[var(--bg-surface)]/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center font-black text-xs text-[var(--brand-primary)]">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{user.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {editingUser?.id === user.id ? (
                  <select 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-[10px] uppercase font-black"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {user.role === 'ADMIN' ? <Shield size={10} /> : <UserIcon size={10} />}
                    {user.role}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {editingUser?.id === user.id ? (
                  <select 
                    value={editingUser.subscriptionId || ""} 
                    onChange={e => setEditingUser({ ...editingUser, subscriptionId: e.target.value || null })}
                    className="bg-[var(--bg)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-[10px] uppercase font-black"
                  >
                    <option value="">No Ticket</option>
                    {subscriptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <span className="text-xs font-bold text-[var(--text-main)]">
                    {user.subscription?.name || "No Ticket"}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {editingUser?.id === user.id ? (
                    <>
                      <button 
                        onClick={() => handleUpdate(user.id, { role: editingUser.role, subscriptionId: editingUser.subscriptionId })}
                        className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-blue-500 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={loading === user.id}
                        className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Check({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
