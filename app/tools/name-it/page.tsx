"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ToolWrapper from "@/components/ToolWrapper";
import { generateNames } from "@/lib/engines";
import { Sparkles, ArrowLeft, Share2, RefreshCw } from "lucide-react";

const categories = ["Baby", "Pet", "Startup", "Band", "WiFi"];

export default function NameItPage() {
  const [thing, setThing] = useState("");
  const [category, setCategory] = useState("");
  const [personality, setPersonality] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState<ReturnType<typeof generateNames> | null>(null);
  const [loading, setLoading] = useState(false);

  const styles = ["Classic", "Playful", "Edgy", "Gentle", "Mysterious"];

  const handleSubmit = async () => {
    if (!thing || !category || !personality || !style) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setResult(generateNames(thing, category, personality, style));
    setLoading(false);
  };

  return (
    <ToolWrapper appId="name-it">
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
        <Navbar />
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Link href="/" className="inline-flex items-center self-start gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Acts
          </Link>

          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
              <Sparkles className="text-[var(--brand-secondary)]" size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4">Name It</h1>
            <p className="text-[var(--text-muted)] font-medium">10 curated names with deep meanings. $1.</p>
          </div>

          {!result ? (
            <div className="card-glass w-full p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">The Subject</label>
                  <input value={thing} onChange={e => setThing(e.target.value)} placeholder="What are we naming?" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-secondary)] outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map(c => (
                        <button key={c} onClick={() => setCategory(c)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${category === c ? 'bg-[var(--brand-secondary)] text-black border-transparent' : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {styles.map(s => (
                        <button key={s} onClick={() => setStyle(s)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${style === s ? 'bg-[var(--brand-secondary)] text-black border-transparent' : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Personality / Vibe</label>
                  <input value={personality} onChange={e => setPersonality(e.target.value)} placeholder="e.g. Elegant and subtle" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-secondary)] outline-none" />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading || !thing || !category || !personality || !style} className="btn-primary w-full py-4 text-lg bg-[var(--brand-secondary)]">
                {loading ? "✨ Consulting the stars..." : "Find Names — Unlimited with Pass"}
              </button>
              <p className="text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-4">
                Included in the $1 or $2 Monthly Circus Pass.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full space-y-6">
              <div className="card-glass w-full p-8 border-[var(--brand-secondary)]/30">
                <div className="text-center mb-10 flex flex-col items-center">
                  <div className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase mb-4">THE CHOSEN ONE</div>
                  <h2 className="text-5xl font-black mb-2">{result.topPick.name}</h2>
                  <div className="text-sm font-bold italic text-[var(--brand-secondary)] mb-4">"{result.topPick.meaning}"</div>
                  <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">{result.topPick.reason}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-8 border-t border-[var(--border-color)]">
                  {result.names.map((n, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] text-center">
                      <div className="font-bold text-xs mb-1">{n.name}</div>
                      <div className="text-[8px] text-[var(--text-muted)] uppercase italic">"{n.meaning}"</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 w-full">
                <button onClick={() => setResult(null)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> New Subject
                </button>
                <button onClick={() => navigator.clipboard.writeText(`The Oracle gave me the perfect name: "${result.topPick.name}". Get yours at One Buck Circus!`)} className="btn-primary flex-1 flex items-center justify-center gap-2 bg-[var(--brand-secondary)]">
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
