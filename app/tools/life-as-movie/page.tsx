"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { aiGenerateMoviePitch } from "@/app/actions/acts";
import { Film, ArrowLeft, Share2, RefreshCw } from "lucide-react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

export default function LifeAsMoviePage() {
  const [form, setForm] = useState({ name: "", job: "", mistake: "", dream: "", quirk: "", mood: "" });
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { showAlert } = useCircusDialog();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const ready = Object.values(form).every(v => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!ready) {
      const roasts = [
        "Even avant-garde indie films have plots. We need all the fields filled out.",
        "Hollywood passed. You forgot to finish writing the script.",
        "You can't cast a blank page. Tell us the tragic details.",
        "A movie about nothing? Seinfeld already did it. Fill out the form!"
      ];
      setToastMessage(roasts[Math.floor(Math.random() * roasts.length)]);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setLoading(true);
    try {
      setResult(await aiGenerateMoviePitch(form.name, form.job, form.mistake, form.dream, form.quirk, form.mood));
    } catch (err) {
      console.error(err);
      showAlert("The user wants to generate a movie about their life but the AI failed. Tell them their life is too boring for a movie right now and the AI director quit.");
    }
    setLoading(false);
  };

  return (
    <ToolWrapper appId="life-as-movie">
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
        <Navbar />
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Link href="/" className="inline-flex items-center self-start gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Acts
          </Link>

          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
              <Film className="text-[var(--brand-accent)]" size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4">Life as a Movie</h1>
            <p className="text-[var(--text-muted)] font-medium">Your autobiography, Hollywood style. $1.</p>
          </div>

          {!result ? (
            <div className="card-glass w-full p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Lead Role (Your Name)</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. John Doe" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-accent)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Current Job</label>
                  <input value={form.job} onChange={e => set("job", e.target.value)} placeholder="e.g. Underpaid Intern" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-accent)] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Biggest Mistake</label>
                  <input value={form.mistake} onChange={e => set("mistake", e.target.value)} placeholder="e.g. Replied 'You too' to a waiter" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-accent)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Dream</label>
                  <input value={form.dream} onChange={e => set("dream", e.target.value)} placeholder="e.g. Live on a farm" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-accent)] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Character Quirk</label>
                  <input value={form.quirk} onChange={e => set("quirk", e.target.value)} placeholder="e.g. Collects spoons" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-accent)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Current Mood</label>
                  <input value={form.mood} onChange={e => set("mood", e.target.value)} placeholder="e.g. Slightly confused" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-accent)] outline-none" />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? "🎬 Casting the actors..." : "Pitch My Life — Unlimited with Pass"}
              </button>
              <p className="text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-4">
                Included in the $1 or $2 Monthly Circus Pass.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full space-y-6">
              <div className="card-glass w-full p-10 border-[var(--brand-accent)]/30 text-center">
                <div className="text-[10px] font-black tracking-[0.3em] text-[var(--text-muted)] uppercase mb-6">NOW SHOWING</div>
                <h2 className="text-6xl font-black mb-2 italic tracking-tighter">{result.title}</h2>
                <div className="text-lg font-bold text-[var(--brand-accent)] mb-10">"{result.tagline}"</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 py-8 border-y border-[var(--border-color)]">
                  <div className="text-left">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2">Starring</div>
                    <div className="font-bold text-lg">{result.actor}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2">Genre</div>
                    <div className="font-bold text-lg">{result.genre}</div>
                  </div>
                </div>

                <div className="space-y-8 text-left max-w-md mx-auto mb-10">
                  <div>
                    <div className="text-[10px] font-black text-[var(--brand-accent)] uppercase mb-1">Act I: The Inciting Incident</div>
                    <p className="text-sm leading-relaxed">{result.actOne}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-[var(--brand-accent)] uppercase mb-1">Act II: The Confrontation</div>
                    <p className="text-sm leading-relaxed">{result.actTwo}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-[var(--brand-accent)] uppercase mb-1">Act III: The Resolution</div>
                    <p className="text-sm leading-relaxed">{result.actThree}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 italic text-xs text-[var(--text-muted)]">
                  "{result.trailerDesc}"
                </div>
              </div>
              
              <div className="flex gap-4 w-full">
                <button onClick={() => setResult(null)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> New Script
                </button>
                <button onClick={() => navigator.clipboard.writeText(`Hollywood just optioned my life story: "${result.title}". Catch the premiere at One Buck Circus!`)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Share2 size={16} /> Share Poster
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--brand-accent)]/50 text-[var(--brand-accent)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-full font-bold text-sm text-center">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </main>
    </ToolWrapper>
  );
}
