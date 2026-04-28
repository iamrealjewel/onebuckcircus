"use client";

import { useState } from "react";
import { Megaphone, Plus, Search, Filter, MoreVertical, Calendar, Target, MousePointer2 } from "lucide-react";

export default function AdminCampaignsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  const campaigns = [
    { id: 1, name: "Summer Clown Recruitment", status: "ACTIVE", reach: "12.4k", clicks: "1.2k", conversion: "8.4%", ends: "2024-08-30" },
    { id: 2, name: "Annihilation Early Bird", status: "ACTIVE", reach: "8.2k", clicks: "2.5k", conversion: "12.1%", ends: "2024-07-15" },
    { id: 3, name: "Referral Bonus Program", status: "ACTIVE", reach: "45.1k", clicks: "5.8k", conversion: "15.2%", ends: "Evergreen" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">Campaigns</h1>
          <p className="text-[var(--text-muted)] font-medium">Manage your outreach and performer recruitment drives.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-4">
          <Plus size={20} />
          Create Campaign
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass p-6 border-blue-500/20 bg-blue-500/5">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Total Reach</div>
          <div className="text-3xl font-black">65.7k</div>
          <div className="text-[10px] text-blue-400/70 font-bold mt-2">+12.4% from last month</div>
        </div>
        <div className="card-glass p-6 border-purple-500/20 bg-purple-500/5">
          <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Avg. Conversion</div>
          <div className="text-3xl font-black">11.9%</div>
          <div className="text-[10px] text-purple-400/70 font-bold mt-2">+2.1% from last month</div>
        </div>
        <div className="card-glass p-6 border-green-500/20 bg-green-500/5">
          <div className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">Active Recruits</div>
          <div className="text-3xl font-black">4,521</div>
          <div className="text-[10px] text-green-400/70 font-bold mt-2">+156 this week</div>
        </div>
      </div>

      <div className="card-glass overflow-hidden border-[var(--border-color)]">
        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab("active")}
              className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === "active" ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab("archived")}
              className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === "archived" ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
            >
              Archived
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
              <input type="text" placeholder="Search campaigns..." className="bg-[var(--bg)] border border-[var(--border-color)] rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-[var(--brand-primary)] w-64" />
            </div>
            <button className="p-2 border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-card)]/50 border-b border-[var(--border-color)]">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Campaign Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Reach</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Engagement</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Conversion</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">End Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[var(--bg-card)] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
                        <Megaphone size={18} />
                      </div>
                      <div>
                        <div className="font-bold">{camp.name}</div>
                        <div className="text-[10px] text-green-500 font-black tracking-widest">{camp.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Target size={14} className="text-[var(--text-muted)]" />
                      {camp.reach}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <MousePointer2 size={14} className="text-[var(--text-muted)]" />
                      {camp.clicks}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-[var(--brand-primary)]">{camp.conversion}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                      <Calendar size={14} />
                      {camp.ends}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg)] rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
