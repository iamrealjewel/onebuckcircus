"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Shield, User as UserIcon, Trash2, Edit2, X, Mail, Key } from "lucide-react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

export default function UserTable({ initialUsers, subscriptions, canEdit = true }: { initialUsers: any[], subscriptions: any[], canEdit?: boolean }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const router = useRouter();
  const { showConfirm } = useCircusDialog();

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "The Ringmaster wants to banish this performer from the circus forever. Generate a funny warning asking if they are absolutely sure.",
      async () => {
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
      }
    );
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

  const handleRequestEmailChange = async (userId: string, email: string) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/request-email-change`, { method: "POST" });
      if (res.ok) showToast(`Email change link sent to ${email}`);
      else showToast("Failed to send email link", "error");
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  const handleRequestPasswordReset = async (userId: string, email: string) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/request-password-reset`, { method: "POST" });
      if (res.ok) showToast(`Password reset link sent to ${email}`);
      else showToast("Failed to send password link", "error");
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${toastMessage.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
          {toastMessage.text}
        </div>
      )}
      <div className="card-glass overflow-hidden">
        <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--bg-surface)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)]">
            <th className="px-6 py-4">Performer</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Ticket (Sub)</th>
            {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[var(--bg-surface)]/50 transition-colors group">
              <td className="px-6 py-4">
                {editingUser?.id === user.id ? (
                  <input 
                    type="text" 
                    value={editingUser.name || ""} 
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-sm font-bold w-full"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center font-black text-xs text-[var(--brand-primary)]">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{user.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{user.email}</div>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                  {user.role === 'ADMIN' ? <Shield size={10} /> : <UserIcon size={10} />}
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-bold text-[var(--text-main)]">
                  {user.subscription?.name || "No Ticket"}
                </span>
              </td>
              {canEdit && (
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingUser?.id === user.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdate(user.id, { name: editingUser.name })}
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
                          onClick={() => handleRequestEmailChange(user.id, user.email)}
                          disabled={loading === user.id}
                          className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-purple-500 transition-colors"
                          title="Send Email Change Link"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={() => handleRequestPasswordReset(user.id, user.email)}
                          disabled={loading === user.id}
                          className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-yellow-500 transition-colors"
                          title="Send Password Reset Link"
                        >
                          <Key size={16} />
                        </button>
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-blue-500 transition-colors"
                          title="Edit User Name"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          disabled={loading === user.id}
                          className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
                          title="Banish Performer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
}

function Check({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
