"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { settleArgument } from "@/lib/engines";
import { Scale, ArrowLeft, Share2, RefreshCw, Sparkles } from "lucide-react";

export default function SettleItPage() {
  const [topic, setTopic] = useState("");
  const [plaintiff, setPlaintiff] = useState("");
  const [defendant, setDefendant] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topic || !plaintiff || !defendant) return;
    setLoading(true);
    
    try {
      // 1. Get base engine verdict
      const verdict = settleArgument(plaintiff, defendant, topic);
      
      // 2. Call the AI Oracle for a "Realistic and Fantastic" expansion
      const aiRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          actId: "settle-it",
          prompt: `Settle this dispute: ${topic}. Plaintiff case: ${plaintiff}. Defendant case: ${defendant}. Initial verdict: ${verdict.verdict}.`
        })
      });
      
      const aiData = await aiRes.json();
      
      // 3. Merge engine logic with AI creativity
      setResult({
        ...verdict,
        aiExpansion: aiData.content,
        oracleName: aiData.model
      });
    } catch (err) {
      console.error(err);
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
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Side</label>
                    <textarea 
                      value={plaintiff} 
                      onChange={e => setPlaintiff(e.target.value)} 
                      rows={4} 
                      placeholder="State your case..." 
                      className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none transition-colors resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Their Side</label>
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
              
              <button 
                onClick={handleSubmit} 
                disabled={loading || !topic || !plaintiff || !defendant} 
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

                  {/* AI Oracle Expansion */}
                  <div className="w-full p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--brand-primary)]/20 mb-8 relative">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--brand-primary)] text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> ORACLE INSIGHT ({result.oracleName})
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)] italic font-medium">
                      "{result.aiExpansion}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-color)]">
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">Plaintiff</div>
                      <div className="text-2xl font-black">{result.plaintiffScore}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-color)]">
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">Defendant</div>
                      <div className="text-2xl font-black">{result.defendantScore}</div>
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
      </main>
    </ToolWrapper>
  );
}
