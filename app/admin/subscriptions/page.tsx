"use client";

import { useState, useEffect } from "react";
import { 
  Shield, Zap, Crown, Dices, Save, 
  RefreshCcw, AlertCircle, CheckCircle, 
  Settings, ToggleLeft as Toggle, Flame, Ghost, Sparkles,
  Calendar, Table, Lock, Unlock, Eye, EyeOff
} from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useCircusDialog } from "@/components/CircusAlertProvider";

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession();
  const { showAlert, showConfirm } = useCircusDialog();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [acts, setActs] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingPlan, setIsEditingPlan] = useState<any>(null);
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
      redirect("/");
    }
    fetchData();
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, actRes, matrixRes] = await Promise.all([
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/acts"),
        fetch("/api/admin/subscription-matrix")
      ]);
      
      const subData = await subRes.json();
      const actData = await actRes.json();
      const matrixData = await matrixRes.json();

      setSubscriptions(Array.isArray(subData) ? subData : []);
      setActs(Array.isArray(actData) ? actData : []);
      setMatrix(Array.isArray(matrixData) ? matrixData : []);
    } catch (err) {
      console.error(err);
      showAlert("Could not fetch the Ringmaster's matrix.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (subId: string, actId: string, data: any) => {
    try {
      const res = await fetch("/api/admin/subscription-matrix", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subId, actId, ...data })
      });
      if (res.ok) {
        // Since the raw SQL bypass returns {success: true}, we update local state manually
        setMatrix(prev => {
          const current = prev.find(m => m.subscriptionId === subId && m.actId === actId) || {
            subscriptionId: subId,
            actId,
            isAvailable: true,
            isFree: false,
            freeUntil: null
          };
          const updated = { ...current, ...data };
          
          const exists = prev.find(m => m.subscriptionId === subId && m.actId === actId);
          if (exists) {
            return prev.map(m => (m.subscriptionId === subId && m.actId === actId) ? updated : m);
          } else {
            return [...prev, updated];
          }
        });
      }
    } catch (err) {
      showAlert("The matrix resisted the update.", true);
    }
  };

  const getConfig = (subId: string, actId: string) => {
    return matrix.find(m => m.subscriptionId === subId && m.actId === actId) || {
      isAvailable: true,
      isFree: false,
      freeUntil: null
    };
  };

  const startEditingLimit = (sub: any) => {
    setEditingLimitId(sub.id);
    setTempLimit(sub.maxActs);
  };

  const saveLimit = async (subId: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subId, maxActs: tempLimit })
      });
      if (res.ok) {
        setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, maxActs: tempLimit } : s));
        setEditingLimitId(null);
        showAlert("The tier limit has been updated.", true);
      }
    } catch (err) {
      showAlert("The ledger resisted the update.", true);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: isEditingPlan.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditingPlan)
      });
      if (res.ok) {
        await fetchData();
        setIsEditingPlan(null);
        showAlert("The circus ledger has been updated.", true);
      }
    } catch (err) {
      showAlert("The ledger refused the update.", true);
    } finally {
      setLoading(false);
    }
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <RefreshCcw className="animate-spin text-[var(--brand-primary)]" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] pt-2 pb-12">
      <div className="w-full space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
              <Shield className="text-purple-500" size={40} /> The Ticket Booth
            </h1>
            <p className="text-[var(--text-muted)] font-medium mt-2">Edit circus passes, pricing, and the availability matrix.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditingPlan({ name: "", tier: "CUSTOM", priceMonthly: 0, priceYearly: 0, maxActs: 1, features: "[]" })}
              className="px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-105 transition-all"
            >
              New Plan
            </button>
            <button onClick={fetchData} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] transition-all">
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptions.map(sub => (
            <div key={sub.id} className="card-glass p-8 border-[var(--border-color)] bg-[var(--bg-surface)]/50 relative overflow-hidden group">
               <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 pointer-events-none ${
                 sub.tier === "CHAOS" ? "bg-blue-500" : sub.tier === "DESTRUCTION" ? "bg-orange-500" : "bg-purple-500"
               }`} />
               
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    sub.tier === "CHAOS" ? "bg-blue-500/10 text-blue-500" :
                    sub.tier === "DESTRUCTION" ? "bg-orange-500/10 text-orange-500" :
                    "bg-purple-500/10 text-purple-500"
                  }`}>
                    {sub.tier === "CHAOS" ? <Dices size={24} /> :
                     sub.tier === "DESTRUCTION" ? <Zap size={24} /> :
                     <Crown size={24} />}
                  </div>
                    <button 
                      onClick={() => setIsEditingPlan(sub)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                    >
                      <Settings size={18} />
                    </button>
               </div>

               <h3 className="text-2xl font-black mb-1">{sub.name}</h3>
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">{sub.tier} Pass</div>

               <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black">${sub.priceMonthly}</span>
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">/ month</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)]/50 border border-[var(--border-color)]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Max Acts</span>
                    <span className="text-sm font-black text-[var(--brand-primary)]">{sub.maxActs === -1 ? "∞" : sub.maxActs}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* MATRIX GRID */}
        <div className="pt-12 border-t border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Table className="text-[var(--brand-primary)]" size={32} />
              <div>
                <h2 className="text-2xl font-black tracking-tight">The Act Matrix</h2>
                <p className="text-xs text-[var(--text-muted)] font-medium">Control which acts are available and free for each tier.</p>
              </div>
            </div>
            
            {/* LEGEND */}
            <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Free Forever</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-purple-500" />
                 <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Free Trial</span>
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[200px]">The Acts</th>
                  {subscriptions.map(sub => (
                    <th key={sub.id} className="p-6 text-center min-w-[250px] border-l border-[var(--border-color)]">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                          sub.tier === "CHAOS" ? "bg-blue-500/10 text-blue-500" :
                          sub.tier === "DESTRUCTION" ? "bg-orange-500/10 text-orange-500" :
                          "bg-purple-500/10 text-purple-500"
                        }`}>
                          {sub.name}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] group/limit">
                           <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">Limit:</span>
                           {editingLimitId === sub.id ? (
                             <input 
                               type="number"
                               value={tempLimit}
                               onChange={(e) => setTempLimit(parseInt(e.target.value))}
                               className="w-12 bg-transparent text-sm font-black text-[var(--brand-primary)] outline-none border-b border-[var(--brand-primary)] text-center"
                               autoFocus
                             />
                           ) : (
                             <span className="text-sm font-black text-[var(--text-main)]">{sub.maxActs === -1 ? "∞" : sub.maxActs}</span>
                           )}
                           
                           {editingLimitId === sub.id ? (
                             <button 
                               onClick={() => saveLimit(sub.id)}
                               className="p-1.5 rounded-md bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all hover:scale-110"
                             >
                               <CheckCircle size={14} />
                             </button>
                           ) : (
                             <button 
                               onClick={() => startEditingLimit(sub)}
                               className="p-1 rounded-md text-[var(--brand-primary)] opacity-40 group-hover/limit:opacity-100 hover:bg-[var(--bg-surface)] transition-all"
                             >
                               <Settings size={14} />
                             </button>
                           )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {acts.map(act => (
                  <tr key={act.id} className="hover:bg-[var(--bg-surface)] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{act.emoji}</span>
                        <div>
                          <h4 className="text-sm font-black text-[var(--text-main)]">{act.name}</h4>
                          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase">{act.id}</p>
                        </div>
                      </div>
                    </td>
                    {subscriptions.map(sub => {
                      const config = getConfig(sub.id, act.id);
                      const isTrial = !!config.freeUntil;
                      
                      const requestUpdate = (newData: any) => {
                        const actionLabel = newData.isFree 
                          ? (newData.freeUntil ? "Enable Free Trial" : "Enable Free Forever")
                          : "Disable Free Status";

                        showConfirm(
                          `Are you sure you want to ${actionLabel} for ${act.name} in the ${sub.name} tier?`,
                          () => handleUpdateConfig(sub.id, act.id, newData),
                          undefined,
                          true // Serious Mode
                        );
                      };

                      return (
                        <td key={`${sub.id}-${act.id}`} className="p-6 border-l border-[var(--border-color)] bg-[var(--bg)]/5">
                          <div className="flex flex-col gap-4">
                            
                            {/* TWO-OPTION TOGGLE */}
                            <div className="grid grid-cols-2 gap-2">
                               <button 
                                 onClick={() => {
                                   if (config.isFree && !isTrial) {
                                     requestUpdate({ isFree: false, freeUntil: null });
                                   } else {
                                     requestUpdate({ isFree: true, freeUntil: null });
                                   }
                                 }}
                                 className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                   config.isFree && !isTrial 
                                     ? "bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                     : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-blue-500/50 hover:text-blue-400"
                                 }`}
                               >
                                 Free Forever
                               </button>
                               <button 
                                 onClick={() => {
                                   if (isTrial) {
                                     requestUpdate({ isFree: false, freeUntil: null });
                                   } else {
                                     requestUpdate({ isFree: true, freeUntil: new Date().toISOString() });
                                   }
                                 }}
                                 className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                   isTrial 
                                     ? "bg-purple-500 border-purple-600 text-white shadow-lg shadow-purple-500/20" 
                                     : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/50 hover:text-purple-400"
                                 }`}
                               >
                                 Free Trial
                               </button>
                            </div>

                            {/* TRIAL DATE PICKER - ALWAYS VISIBLE IF TRIAL IS ACTIVE */}
                            {isTrial && (
                               <div className="space-y-2 animate-in zoom-in-95 duration-200">
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg)] border border-purple-500/30 focus-within:border-purple-500 transition-all">
                                     <Calendar size={14} className="text-purple-400" />
                                     <input 
                                       type="date" 
                                       value={config.freeUntil ? new Date(config.freeUntil).toISOString().split('T')[0] : ""}
                                       onChange={(e) => requestUpdate({ freeUntil: e.target.value || null })}
                                       className="bg-transparent text-[10px] font-black outline-none w-full text-[var(--text-main)]"
                                     />
                                  </div>
                                  <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest px-1 text-center">
                                    Ends: {new Date(config.freeUntil).toLocaleDateString()}
                                  </div>
                               </div>
                            )}

                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PLAN EDITOR MODAL */}
      {isEditingPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-md" onClick={() => setIsEditingPlan(null)} />
           <div className="card-glass w-full max-w-lg relative z-10 p-8 border-[var(--border-color)] animate-in zoom-in-95 duration-200">
              <h2 className="text-3xl font-black mb-6 tracking-tight text-[var(--text-main)]">
                {isEditingPlan.id ? "Edit Plan" : "New Circus Pass"}
              </h2>
              
              <form onSubmit={handleUpdatePlan} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Plan Name</label>
                       <input 
                         type="text" 
                         value={isEditingPlan.name}
                         onChange={(e) => setIsEditingPlan({...isEditingPlan, name: e.target.value})}
                         className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] focus:border-[var(--brand-primary)] outline-none font-bold text-sm text-[var(--text-main)]"
                         placeholder="e.g. Chaos"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Tier ID</label>
                       <input 
                         type="text" 
                         value={isEditingPlan.tier}
                         onChange={(e) => setIsEditingPlan({...isEditingPlan, tier: e.target.value.toUpperCase()})}
                         className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] focus:border-[var(--brand-primary)] outline-none font-bold text-sm text-[var(--text-main)]"
                         placeholder="e.g. CHAOS"
                         required
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Monthly Price ($)</label>
                       <input 
                         type="number" 
                         step="0.01"
                         value={isEditingPlan.priceMonthly}
                         onChange={(e) => setIsEditingPlan({...isEditingPlan, priceMonthly: parseFloat(e.target.value)})}
                         className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] focus:border-[var(--brand-primary)] outline-none font-bold text-sm text-[var(--text-main)]"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Max Acts (-1 = ∞)</label>
                       <input 
                         type="number" 
                         value={isEditingPlan.maxActs}
                         onChange={(e) => setIsEditingPlan({...isEditingPlan, maxActs: parseInt(e.target.value)})}
                         className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] focus:border-[var(--brand-primary)] outline-none font-bold text-sm text-[var(--text-main)]"
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Features (JSON Array)</label>
                    <textarea 
                      value={isEditingPlan.features}
                      onChange={(e) => setIsEditingPlan({...isEditingPlan, features: e.target.value})}
                      className="w-full h-24 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] focus:border-[var(--brand-primary)] outline-none font-mono text-xs text-[var(--text-main)]"
                      placeholder='["Feature 1", "Feature 2"]'
                    />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingPlan(null)}
                      className="flex-grow py-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--bg)] transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-grow py-4 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-105 transition-all"
                    >
                      Save Plan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </main>
  );
}
