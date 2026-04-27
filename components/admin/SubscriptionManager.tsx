"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Ticket, Trash2, Edit2, CheckCircle2, X, Save } from "lucide-react";

export default function SubscriptionManager({ initialSubscriptions }: { initialSubscriptions: any[] }) {
  const [subs, setSubs] = useState(initialSubscriptions);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    tier: "",
    priceMonthly: 0,
    priceYearly: 0,
    maxActs: 3,
    features: ["Standard Access"]
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this ticket tier? This might affect current subscribers.")) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubs(subs.filter(s => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  const handleSave = async (id?: string) => {
    const data = id ? editingSub : formData;
    setLoading(id || "new");
    try {
      const res = await fetch(id ? `/api/admin/subscriptions/${id}` : "/api/admin/subscriptions", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          features: typeof data.features === 'string' ? data.features : JSON.stringify(data.features)
        })
      });
      if (res.ok) {
        const saved = await res.json();
        if (id) {
          setSubs(subs.map(s => s.id === id ? saved : s));
          setEditingSub(null);
        } else {
          setSubs([...subs, saved]);
          setIsAdding(false);
          setFormData({ name: "", tier: "", priceMonthly: 0, priceYearly: 0, maxActs: 3, features: ["Standard Access"] });
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Ticket Booth</h1>
          <p className="text-[var(--text-muted)] font-medium">Configure subscription tiers, pricing, and act limits.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2 py-3 px-6 text-sm">
            <Plus size={18} /> New Tier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAdding && (
          <div className="card-glass p-8 flex flex-col border-2 border-dashed border-[var(--brand-primary)] animate-pulse">
            <h3 className="text-xl font-black mb-6">Create New Tier</h3>
            <div className="space-y-4 mb-8">
              <input placeholder="Tier Name (e.g. Chaos)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm" />
              <input placeholder="Tier Code (e.g. CHAOS)" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value.toUpperCase()})} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Monthly Price" value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: parseFloat(e.target.value)})} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm" />
                <input type="number" placeholder="Yearly Price" value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: parseFloat(e.target.value)})} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm" />
              </div>
              <input type="number" placeholder="Max Acts (-1 for unlimited)" value={formData.maxActs} onChange={e => setFormData({...formData, maxActs: parseInt(e.target.value)})} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm" />
            </div>
            <div className="flex gap-2 mt-auto">
              <button onClick={() => handleSave()} className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2">
                <Save size={14} /> Create
              </button>
              <button onClick={() => setIsAdding(false)} className="btn-outline flex-1 py-3 text-xs">Cancel</button>
            </div>
          </div>
        )}

        {subs.map((sub) => {
          const isEditing = editingSub?.id === sub.id;
          const current = isEditing ? editingSub : sub;
          const features = typeof current.features === 'string' ? JSON.parse(current.features) : current.features;

          return (
            <div key={sub.id} className="card-glass p-8 flex flex-col h-full relative overflow-hidden group border-t-4" style={{ borderTopColor: sub.tier === 'ANNIHILATION' ? 'var(--brand-accent)' : sub.tier === 'DESTRUCTION' ? 'var(--brand-secondary)' : 'var(--brand-primary)' }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{current.tier}</div>
                  {isEditing ? (
                    <input value={current.name} onChange={e => setEditingSub({...editingSub, name: e.target.value})} className="bg-transparent border-b border-[var(--brand-primary)] font-black text-xl w-full outline-none" />
                  ) : (
                    <h3 className="text-2xl font-black">{current.name}</h3>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <button onClick={() => handleSave(sub.id)} className="p-2 rounded-lg bg-green-500/20 text-green-500"><Save size={14} /></button>
                  ) : (
                    <button onClick={() => setEditingSub(sub)} className="p-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--brand-primary)]"><Edit2 size={14} /></button>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  {isEditing ? (
                    <input type="number" value={current.priceMonthly} onChange={e => setEditingSub({...editingSub, priceMonthly: parseFloat(e.target.value)})} className="bg-transparent border-b border-[var(--brand-primary)] font-black text-4xl w-24 outline-none" />
                  ) : (
                    <span className="text-5xl font-black tracking-tighter">${current.priceMonthly}</span>
                  )}
                  <span className="text-sm text-[var(--text-muted)] font-bold">/mo</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border-color)]">
                  <div className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1">Act Limit</div>
                  {isEditing ? (
                    <input type="number" value={current.maxActs} onChange={e => setEditingSub({...editingSub, maxActs: parseInt(e.target.value)})} className="bg-transparent font-bold text-sm w-full outline-none" />
                  ) : (
                    <div className="text-sm font-bold">{current.maxActs === -1 ? 'Unlimited Acts' : `${current.maxActs} Acts Selection`}</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {features.map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                      <CheckCircle2 size={12} className="text-[var(--brand-primary)]" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleDelete(sub.id)}
                className="w-full py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Retire Tier
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
