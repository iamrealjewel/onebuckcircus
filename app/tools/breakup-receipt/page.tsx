"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { generateReceipt } from "@/lib/engines";
import { Receipt, ArrowLeft, Share2, RefreshCw } from "lucide-react";

const types = ["Romantic", "Toxic Friend", "Bad Job", "Situationship"];

export default function BreakupReceiptPage() {
  const [form, setForm] = useState({ name: "", theirName: "", duration: "", type: "", redFlags: "", bestMemory: "" });
  const [result, setResult] = useState<ReturnType<typeof generateReceipt> | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const ready = Object.values(form).every(v => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!ready) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setResult(generateReceipt(form.name, form.theirName, form.duration, form.type, form.redFlags, form.bestMemory));
    setLoading(false);
  };

  return (
    <ToolWrapper appId="breakup-receipt">
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
        <Navbar />
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Link href="/" className="inline-flex items-center self-start gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Acts
          </Link>

          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
              <Receipt className="text-[var(--brand-primary)]" size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4">Breakup Receipt</h1>
            <p className="text-[var(--text-muted)] font-medium">Get official closure for any relationship. $1.</p>
          </div>

          {!result ? (
            <div className="card-glass w-full p-8 space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Name</label>
                    <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="You" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Their Name</label>
                    <input value={form.theirName} onChange={e => set("theirName", e.target.value)} placeholder="Them" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Months Active</label>
                    <input value={form.duration} onChange={e => set("duration", e.target.value)} type="number" placeholder="e.g. 18" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Type</label>
                    <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none">
                      <option value="">Select Type</option>
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-2">Red Flags (comma separated)</label>
                  <textarea value={form.redFlags} onChange={e => set("redFlags", e.target.value)} rows={2} placeholder="What went wrong?" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none resize-none" />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading || !ready} className="btn-primary w-full py-4 text-lg">
                {loading ? "🧾 Printing receipt..." : "Get Receipt — Unlimited with Pass"}
              </button>
              <p className="text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-4">
                Included in the $1 or $2 Monthly Circus Pass.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full space-y-6">
              <div className="card-glass w-full p-8 border-[var(--brand-primary)]/30 font-mono text-[10px] bg-white text-black">
                <div className="text-center border-b border-black/10 pb-6 mb-6">
                  <div className="font-black tracking-[0.2em] mb-1 uppercase">ONE BUCK CIRCUS • OFFICIAL RECEIPT</div>
                  <div>#{result.receiptNumber} • {result.timestamp}</div>
                  <div className="mt-4 text-lg font-black uppercase">ACCOUNT TERMINATED</div>
                </div>

                <div className="space-y-3 mb-8">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <span className="uppercase">{item.label}</span>
                      <div className="text-right">
                        <div className="font-bold">{item.value}</div>
                        <div className="text-[8px] opacity-60 italic">({item.note})</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/10 pt-6 mb-6">
                  <div className="flex justify-between mb-2">
                    <span>SUBTOTAL</span>
                    <span className="font-bold uppercase">{result.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>FEES</span>
                    <span className="font-bold uppercase">{result.tax}</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t border-black/10 pt-4 mt-4">
                    <span>REFUND STATUS</span>
                    <span className={result.refundStatus.includes("APPROVED") ? "text-green-600" : "text-red-600"}>{result.refundStatus}</span>
                  </div>
                </div>

                <div className="p-4 bg-black/5 rounded-lg mb-6">
                  <div className="font-black mb-1 uppercase">THE LESSON:</div>
                  <p className="leading-relaxed italic">"{result.lesson}"</p>
                </div>

                <div className="text-center italic opacity-60 leading-relaxed max-w-xs mx-auto">
                  {result.closingStatement}
                </div>
              </div>
              
              <div className="flex gap-4 w-full">
                <button onClick={() => setResult(null)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> New Receipt
                </button>
                <button onClick={() => navigator.clipboard.writeText(`I officially terminated my account with my ex. Refund status: ${result.refundStatus}. Get your breakup receipt at One Buck Circus!`)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Share2 size={16} /> Share Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </ToolWrapper>
  );
}
