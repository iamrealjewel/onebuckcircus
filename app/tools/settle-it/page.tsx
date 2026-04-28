"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { aiSettleArgument } from "@/app/actions/acts";
import { Scale, ArrowLeft, Share2, RefreshCw, Sparkles } from "lucide-react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

export default function SettleItPage() {
  const [topic, setTopic] = useState("");
  const [pName, setPName] = useState("");
  const [plaintiff, setPlaintiff] = useState("");
  const [dName, setDName] = useState("");
  const [defendant, setDefendant] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { showAlert } = useCircusDialog();

  const handleSubmit = async () => {
    if (!topic || !plaintiff || !defendant || !pName || !dName) {
      const roasts = [
        "The judge is not a mind reader. State ALL the arguments AND names!",
        "Court requires ALL documentation. Fill in the blanks before we hold you in contempt.",
        "Are we arguing about nothing? Because that's what you typed.",
        "You expect a ruling on half a story? Submit the whole thing."
      ];
      setToastMessage(roasts[Math.floor(Math.random() * roasts.length)]);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setLoading(true);
    
    try {
      const verdict = await aiSettleArgument(pName, plaintiff, dName, defendant, topic);
      setResult(verdict);
    } catch (err) {
      console.error(err);
      showAlert("The user tried to settle an argument but the AI failed. Roast them for their petty dispute breaking the Oracle.");
    }
    
    setLoading(false);
  };

  return (
    <ToolWrapper appId="settle-it">
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
        <Navbar />
        
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Link href="/" className="inline-flex items-center self-start gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Acts
          </Link>

          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
              <Scale className="text-[var(--brand-primary)]" size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4">Settle It</h1>
            <p className="text-[var(--text-muted)] font-medium">The Court of Chaos is now in session. $1.</p>
          </div>

          {!result ? (
            <div className="card-glass w-full p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-2">The Dispute</label>
                  <input 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)} 
                    placeholder="e.g. Who should do the dishes tonight" 
                    className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Name</label>
                      <input 
                        value={pName} 
                        onChange={e => setPName(e.target.value)} 
                        placeholder="e.g. Alice" 
                        className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Argument</label>
                      <textarea 
                        value={plaintiff} 
                        onChange={e => setPlaintiff(e.target.value)} 
                        rows={4} 
                        placeholder="State your case..." 
                        className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none transition-colors resize-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Their Name</label>
                      <input 
                        value={dName} 
                        onChange={e => setDName(e.target.value)} 
                        placeholder="e.g. Bob" 
                        className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Their Flawed Argument</label>
                      <textarea 
                        value={defendant} 
                        onChange={e => setDefendant(e.target.value)} 
                        rows={4} 
                        placeholder="Present their argument..." 
                        className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none transition-colors resize-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="btn-primary w-full py-4 text-lg"
              >
                {loading ? "🔨 Deliberating..." : "Settle It — Unlimited with Pass"}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in w-full space-y-6">
              <div className="card-glass w-full p-8 border-[var(--brand-primary)]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="text-center relative z-10 flex flex-col items-center">
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)] mb-4">
                    OFFICIAL VERDICT • CASE #{result.caseNumber}
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-6" />
                  
                  <div className="text-[10px] font-black text-[var(--text-muted)] mb-2 uppercase">{result.judge} presiding</div>
                  <div className="text-3xl font-black mb-6 leading-tight">
                    {result.verdict}
                  </div>
                  
                  <p className="text-lg font-medium italic text-[var(--text-main)] mb-8 leading-relaxed">
                    "{result.ruling}"
                  </p>



                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-color)] text-center relative overflow-hidden">
                      {result.winner === "plaintiff" && <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />}
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">{pName}</div>
                      <div className="text-3xl font-black">{result.plaintiffScore}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-color)] text-center relative overflow-hidden">
                      {result.winner === "defendant" && <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />}
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">{dName}</div>
                      <div className="text-3xl font-black">{result.defendantScore}</div>
                    </div>
                  </div>

                  <div className="w-full p-4 rounded-xl bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-xs font-black uppercase tracking-widest text-[var(--brand-accent)]">
                    COURT ORDER: {result.penalty}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button onClick={() => setResult(null)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> New Case
                </button>
                <button onClick={() => navigator.clipboard.writeText(`I just settled an argument at One Buck Circus! Case #${result.caseNumber}: ${result.verdict}`)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Share2 size={16} /> Share Result
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)]/50 text-[var(--brand-primary)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-full font-bold text-sm text-center">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </main>
    </ToolWrapper>
  );
}
