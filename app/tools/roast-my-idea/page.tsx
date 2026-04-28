"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { aiRoastIdea } from "@/app/actions/acts";
import { Flame, ArrowLeft, Share2, RefreshCw } from "lucide-react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

export default function RoastMyIdeaPage() {
  const [idea, setIdea] = useState("");
  const [stage, setStage] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { showAlert } = useCircusDialog();

  const handleSubmit = async () => {
    if (!idea || !stage || !audience) {
      const roasts = [
        "The idea is so bad you couldn't even finish writing it down?",
        "We can't roast an empty plate. Give us the details.",
        "Did you forget your own startup pitch? Typical.",
        "VCs would pass on this blank form. And so do we."
      ];
      setToastMessage(roasts[Math.floor(Math.random() * roasts.length)]);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setLoading(true);
    try {
      setResult(await aiRoastIdea(idea, stage, audience));
    } catch (err) {
      console.error(err);
      showAlert("The user tried to get their startup idea roasted but the AI failed. Tell them their idea was so bad it literally broke the Oracle's crystal ball.");
    }
    setLoading(false);
  };

  return (
    <ToolWrapper appId="roast-my-idea">
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
        <Navbar />
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Link href="/" className="inline-flex items-center self-start gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Acts
          </Link>

          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
              <Flame className="text-[var(--brand-secondary)]" size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4">Roast My Idea</h1>
            <p className="text-[var(--text-muted)] font-medium">Brutal honesty for your next big thing. $1.</p>
          </div>

          {!result ? (
            <div className="card-glass w-full p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">The Concept</label>
                  <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="Describe your billion-dollar idea..." className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-secondary)] outline-none resize-none" rows={4} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Stage</label>
                    <select value={stage} onChange={e => setStage(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-secondary)] outline-none">
                      <option value="">Select Stage</option>
                      <option value="Shower Thought">Shower Thought</option>
                      <option value="MVP / Beta">MVP / Beta</option>
                      <option value="Scaling (allegedly)">Scaling (allegedly)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Target Audience</label>
                    <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Gen Z crypto bros" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-secondary)] outline-none" />
                  </div>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-lg bg-[var(--brand-secondary)]">
                {loading ? "🔥 Heating up the oven..." : "Roast Me — Unlimited with Pass"}
              </button>
              <p className="text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-4">
                Requires a $1 or $2 Monthly Circus Pass.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full space-y-6">
              <div className="card-glass w-full p-8 border-[var(--brand-secondary)]/30">
                <div className="text-center mb-10">
                  <div className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase mb-4">THE BRUTAL VERDICT</div>
                  <h2 className="text-5xl font-black mb-4">"{result.verdict}"</h2>
                  <div className="inline-block px-4 py-1 rounded-full bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)] text-xs font-black uppercase tracking-widest">
                    SURVIVAL CHANCE: {result.survivalChance}%
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="p-6 rounded-2xl bg-[var(--bg)] border border-red-500/20 italic text-lg leading-relaxed text-center">
                    "{result.mainRoast}"
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2">Pivot Suggestion</div>
                    <p className="text-sm font-bold italic">"{result.pivotSuggestion}"</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--border-color)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-secondary)] mb-4">5 STEPS TO SALVAGE THIS</div>
                  <div className="grid grid-cols-1 gap-4">
                    {result.improvements.map((imp, i) => (
                      <div key={i} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg)]">
                        <div className="font-black text-sm mb-1">{imp.title}</div>
                        <p className="text-xs text-[var(--text-muted)]">{imp.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] italic">
                  {result.closingLine}
                </div>
              </div>
              
              <div className="flex gap-4 w-full">
                <button onClick={() => setResult(null)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> New Idea
                </button>
                <button onClick={() => navigator.clipboard.writeText(`My startup idea just got roasted at One Buck Circus! Verdict: "${result.verdict}". Survival chance: ${result.survivalChance}%`)} className="btn-primary flex-1 flex items-center justify-center gap-2 bg-[var(--brand-secondary)]">
                  <Share2 size={16} /> Share Result
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--brand-secondary)]/50 text-[var(--brand-secondary)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-full font-bold text-sm text-center">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </main>
    </ToolWrapper>
  );
}
