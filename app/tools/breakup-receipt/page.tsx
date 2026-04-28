"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { aiGenerateReceipt } from "@/app/actions/acts";
import { Receipt, ArrowLeft, Share2, RefreshCw, Printer } from "lucide-react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

const types = ["Romantic", "Toxic Friend", "Bad Job", "Situationship"];

export default function BreakupReceiptPage() {
  const [form, setForm] = useState({ name: "", theirName: "", duration: "", type: "", redFlags: "", bestMemory: "" });
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { showAlert } = useCircusDialog();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const ready = Object.values(form).every(v => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!ready) {
      const roasts = [
        "We can't print a receipt for air. Fill out the fields!",
        "Are you trying to break up with a ghost? Missing some details here.",
        "The Oracle needs ALL the details to calculate your emotional damage correctly.",
        "Leaving fields blank? No wonder it didn't work out."
      ];
      setToastMessage(roasts[Math.floor(Math.random() * roasts.length)]);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setLoading(true);
    try {
      setResult(await aiGenerateReceipt(form.name, form.theirName, form.duration, form.type, form.redFlags, form.bestMemory));
    } catch (err) {
      console.error(err);
      showAlert("The user wants to generate a breakup receipt but the AI failed. Tell them the Oracle is still processing its own emotional baggage and to try again later.");
    }
    setLoading(false);
  };

  return (
    <ToolWrapper appId="breakup-receipt">
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center print:p-0 print:bg-white print:min-h-0">
        <div className="print:hidden w-full flex justify-center"><Navbar /></div>
        <div className="w-full max-w-2xl flex flex-col items-center print:block print:max-w-none">
          <Link href="/" className="inline-flex items-center self-start gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors print:hidden">
            <ArrowLeft size={14} /> Back to Acts
          </Link>

          <div className="text-center mb-12 flex flex-col items-center print:hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-2">Red Flags</label>
                    <textarea value={form.redFlags} onChange={e => set("redFlags", e.target.value)} rows={2} placeholder="What went wrong?" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-2">Best Memory</label>
                    <textarea value={form.bestMemory} onChange={e => set("bestMemory", e.target.value)} rows={2} placeholder="One good thing?" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none resize-none" />
                  </div>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? "🧾 Printing receipt..." : "Get Receipt — Unlimited with Pass"}
              </button>
              <p className="text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-4">
                Included in the $1 or $2 Monthly Circus Pass.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full space-y-6 print:space-y-0 print:w-[3in] print:mx-auto">
              <div id="receipt-content" className="w-full p-8 font-mono text-xs bg-slate-50 text-slate-900 shadow-2xl rounded-sm border-t-8 border-t-[var(--brand-primary)] relative overflow-hidden print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
                <div className="text-center border-b-2 border-slate-300 pb-6 mb-6">
                  <div className="font-black tracking-[0.2em] mb-1 uppercase text-slate-800">ONE BUCK CIRCUS • OFFICIAL RECEIPT</div>
                  <div className="text-slate-500">#{result.receiptNumber} • {result.timestamp}</div>
                  <div className="mt-4 text-lg font-black uppercase text-red-600 tracking-widest">ACCOUNT TERMINATED</div>
                </div>

                <div className="space-y-4 mb-8">
                  {result.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-4 border-b border-slate-200 border-dashed pb-2">
                      <span className="uppercase font-bold text-slate-700">{item.label}</span>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{item.value}</div>
                        <div className="text-[10px] text-slate-500 italic">({item.note})</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-slate-300 pt-6 mb-6">
                  <div className="flex justify-between mb-3 text-slate-700">
                    <span className="font-bold">SUBTOTAL</span>
                    <span className="font-black uppercase">{result.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-3 text-slate-700">
                    <span className="font-bold">FEES</span>
                    <span className="font-black uppercase">{result.tax}</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t-2 border-slate-300 pt-4 mt-4">
                    <span className="text-slate-800">REFUND STATUS</span>
                    <span className={result.refundStatus.includes("APPROVED") ? "text-emerald-600" : "text-red-600"}>{result.refundStatus}</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-200/50 rounded-lg mb-6 border border-slate-300">
                  <div className="font-black mb-2 uppercase text-slate-800 tracking-widest">THE LESSON:</div>
                  <p className="leading-relaxed italic text-slate-700">"{result.lesson}"</p>
                </div>

                <div className="text-center italic text-slate-500 leading-relaxed max-w-sm mx-auto text-[10px]">
                  {result.closingStatement}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 w-full print:hidden">
                <button onClick={() => window.print()} className="btn-outline flex-1 flex items-center justify-center gap-2 bg-[var(--bg-card)] border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white">
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button onClick={() => navigator.clipboard.writeText(`I officially terminated my account with my ex. Refund status: ${result.refundStatus}. Get your breakup receipt at One Buck Circus!`)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Share2 size={16} /> Share
                </button>
                <button onClick={() => setResult(null)} className="btn-outline w-full md:w-auto flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> New Receipt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300 print:hidden">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)]/50 text-[var(--brand-primary)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-full font-bold text-sm text-center">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </main>
    </ToolWrapper>
  );
}
