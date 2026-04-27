"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Plus, Globe, Trash2, Edit2, Save, X, CheckCircle2, ChevronDown, Sparkles, Wand2, Loader2 } from "lucide-react";

const PROVIDERS = [
  { 
    name: "Groq", 
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma-7b-it"],
    baseUrl: "https://api.groq.com/openai/v1"
  },
  { 
    name: "OpenAI", 
    models: ["gpt-4o", "gpt-4-turbo", "gpt-4o-mini", "gpt-3.5-turbo"],
    baseUrl: "https://api.openai.com/v1"
  },
  { 
    name: "Anthropic", 
    models: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    baseUrl: "https://api.anthropic.com/v1"
  },
  {
    name: "Google Gemini",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai"
  },
  {
    name: "Mistral",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mixtral-8x22b"],
    baseUrl: "https://api.mistral.ai/v1"
  },
  {
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-coder"],
    baseUrl: "https://api.deepseek.com"
  },
  {
    name: "Perplexity",
    models: ["llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-small-128k-online"],
    baseUrl: "https://api.perplexity.ai"
  }
];

export default function AIModelManager({ initialModels }: { initialModels: any[] }) {
  const [models, setModels] = useState(initialModels);
  const [activeForm, setActiveForm] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "Groq",
    modelName: "llama-3.1-8b-instant",
    apiKey: "",
    apiUrl: "https://api.groq.com/openai/v1",
    isActive: true,
    isGlobalDefault: false
  });

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const res = await fetch("/api/admin/ai/discover");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error(err);
    }
    setDiscovering(false);
  };

  const addSuggestion = (s: any) => {
    setFormData({
      name: s.name,
      modelName: s.modelName,
      apiKey: "",
      apiUrl: s.apiUrl,
      isActive: true,
      isGlobalDefault: false
    });
    setActiveForm("add");
    setSuggestions([]);
  };

  const handleProviderChange = (providerName: string) => {
    const provider = PROVIDERS.find(p => p.name === providerName);
    if (provider) {
      setFormData({
        ...formData,
        name: provider.name,
        modelName: provider.models[0],
        apiUrl: provider.baseUrl
      });
    }
  };

  const handleEdit = (model: any) => {
    setFormData({
      name: model.name,
      modelName: model.modelName,
      apiKey: model.apiKey || "",
      apiUrl: model.apiUrl || "",
      isActive: model.isActive,
      isGlobalDefault: model.isGlobalDefault
    });
    setEditingId(model.id);
    setActiveForm("edit");
  };

  const handleToggleDefault = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/ai/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGlobalDefault: true, isActive: true })
      });
      if (res.ok) {
        setModels(models.map(m => ({
          ...m,
          isGlobalDefault: m.id === id,
          isActive: m.id === id ? true : m.isActive
        })));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently remove this Oracle?")) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/ai/${id}`, { method: "DELETE" });
      if (res.ok) {
        setModels(models.filter(m => m.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  const handleSave = async () => {
    setLoading(activeForm === "edit" ? editingId : "new");
    try {
      const url = activeForm === "edit" ? `/api/admin/ai/${editingId}` : "/api/admin/ai";
      const method = activeForm === "edit" ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (activeForm === "edit") {
          setModels(models.map(m => m.id === editingId ? saved : m));
        } else {
          setModels([saved, ...models]);
        }
        setActiveForm("none");
        setEditingId(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Oracle Selection</h1>
          <p className="text-[var(--text-muted)] font-medium">Pick your primary intelligence source. One click to activate.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDiscover} 
            disabled={discovering}
            className="btn-outline flex items-center gap-2 py-3 px-6 text-sm border-purple-500/30 text-purple-400 hover:bg-purple-500/5"
          >
            {discovering ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            Ask the Oracle
          </button>
          {activeForm === "none" && (
            <button onClick={() => setActiveForm("add")} className="btn-primary flex items-center gap-2 py-3 px-6 text-sm">
              <Plus size={18} /> Add Oracle
            </button>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="card-glass p-8 bg-purple-500/5 border border-purple-500/20 animate-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              The Oracle Suggests...
            </h3>
            <button onClick={() => setSuggestions([])} className="text-[var(--text-muted)] hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => addSuggestion(s)}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-left hover:border-purple-500/50 transition-all group"
              >
                <div className="font-black text-sm mb-1 group-hover:text-purple-400 transition-colors">{s.name}</div>
                <div className="text-[10px] text-[var(--text-muted)] mb-3">{s.modelName}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-purple-400/70">{s.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeForm !== "none" && (
        <div className="card-glass p-10 border-2 border-[var(--brand-primary)] animate-in fade-in zoom-in duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Sparkles className="text-[var(--brand-primary)]" />
              {activeForm === "add" ? "Manifest New Oracle" : "Reconfigure Oracle"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 ml-1">AI Provider</label>
                  <div className="relative">
                    <select 
                      value={formData.name} 
                      onChange={e => handleProviderChange(e.target.value)}
                      className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm focus:border-[var(--brand-primary)] outline-none appearance-none cursor-pointer"
                    >
                      {PROVIDERS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      <option value="Custom">Custom</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 ml-1">Model ID</label>
                  <div className="relative">
                    {formData.name !== "Custom" && PROVIDERS.find(p => p.name === formData.name) ? (
                      <>
                        <select 
                          value={formData.modelName} 
                          onChange={e => setFormData({...formData, modelName: e.target.value})}
                          className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm focus:border-[var(--brand-primary)] outline-none appearance-none cursor-pointer"
                        >
                          {PROVIDERS.find(p => p.name === formData.name)?.models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                      </>
                    ) : (
                      <input 
                        placeholder="e.g. your-custom-model" 
                        value={formData.modelName} 
                        onChange={e => setFormData({...formData, modelName: e.target.value})} 
                        className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm focus:border-[var(--brand-primary)] outline-none" 
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 ml-1">Secret API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-••••••••••••••••" 
                    value={formData.apiKey} 
                    onChange={e => setFormData({...formData, apiKey: e.target.value})} 
                    className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm focus:border-[var(--brand-primary)] outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 ml-1">Base API URL</label>
                  <input 
                    placeholder="https://api.example.com/v1" 
                    value={formData.apiUrl} 
                    onChange={e => setFormData({...formData, apiUrl: e.target.value})} 
                    className="w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm focus:border-[var(--brand-primary)] outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSave} 
                disabled={!!loading}
                className="btn-primary flex-1 py-5 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {loading ? "Magic in progress..." : activeForm === "add" ? "Manifest Oracle" : "Update Configuration"}
                <Save size={20} />
              </button>
              <button 
                onClick={() => setActiveForm("none")} 
                className="btn-outline px-10 py-5 text-lg font-black uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div 
            key={model.id} 
            className={`card-glass p-8 flex flex-col gap-6 relative transition-all duration-500 group ${model.isGlobalDefault ? 'border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-2xl' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
          >
            {model.isGlobalDefault && (
              <div className="absolute top-4 right-4 text-[var(--brand-primary)] animate-pulse">
                <CheckCircle2 size={24} />
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${model.isGlobalDefault ? 'bg-[var(--brand-primary)] text-white border-transparent' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-color)] group-hover:text-[var(--brand-primary)] group-hover:border-[var(--brand-primary)]/30'}`}>
                <Cpu size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black leading-none mb-1">{model.name}</h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{model.modelName}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className={model.isActive ? 'text-green-500' : 'text-red-500'}>{model.isActive ? 'Online' : 'Offline'}</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)]">
                <Globe size={14} className="text-[var(--text-muted)]" />
                <span className="text-[10px] font-bold truncate max-w-[150px]">{model.apiUrl || 'Standard REST'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleEdit(model)}
                  className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors flex items-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(model.id)}
                  className="text-xs font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              
              {model.isGlobalDefault ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">Default</span>
              ) : (
                <button 
                  onClick={() => handleToggleDefault(model.id)}
                  className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  Activate
                </button>
              )}
            </div>

            {loading === model.id && (
              <div className="absolute inset-0 bg-[var(--bg-card)]/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-20">
                <div className="animate-spin text-2xl">🪄</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
