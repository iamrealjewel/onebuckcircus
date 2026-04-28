"use client";

import { useState } from "react";
import { Settings, Save, Shield, Globe, Bell, Zap } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">Tent Settings</h1>
        <p className="text-[var(--text-muted)] font-medium">Configure the core parameters of the circus.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* General Settings */}
          <section className="card-glass p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="text-[var(--brand-primary)]" size={24} />
              <h2 className="text-xl font-black">Global Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Circus Name</label>
                <input type="text" defaultValue="One Buck Circus" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Support Email</label>
                <input type="email" defaultValue="oracle@onebuckcircus.com" className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:border-[var(--brand-primary)] outline-none" />
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="card-glass p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-[var(--brand-secondary)]" size={24} />
              <h2 className="text-xl font-black">Security & Access</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-xl border border-[var(--border-color)]">
                <div>
                  <div className="font-bold">Public Registration</div>
                  <div className="text-xs text-[var(--text-muted)]">Allow new performers to join the circus.</div>
                </div>
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-xl border border-[var(--border-color)]">
                <div>
                  <div className="font-bold">Magic Link Authentication</div>
                  <div className="text-xs text-[var(--text-muted)]">Use passwordless login for all accounts.</div>
                </div>
                <div className="w-12 h-6 bg-[var(--border-color)] rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Action Sidebar */}
          <div className="card-glass p-8 border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 sticky top-8">
            <h3 className="text-lg font-black mb-4">Save Changes</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6 font-medium leading-relaxed">
              Updates to the global configuration are applied instantly across all instances of the tent.
            </p>
            <button 
              onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? "Applying..." : "Save Configuration"}
            </button>
          </div>

          <div className="card-glass p-8 border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-500 mb-4">
              <Zap size={18} />
              <h3 className="font-black">Emergency Protocols</h3>
            </div>
            <button className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all">
              Maintenance Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
