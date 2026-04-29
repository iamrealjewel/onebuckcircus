"use client";

import { useState, useEffect } from "react";
import { Bell, Flame, Swords, Info, X, Trash2, CheckCircle, Ghost } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NotificationCenter() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!session) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all group"
      >
        <Bell size={18} className={`${unreadCount > 0 ? "animate-bounce" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg)] shadow-lg shadow-red-500/20">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 max-h-[500px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-widest">Message Center</h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[9px] font-black uppercase tracking-tighter border border-[var(--brand-primary)]/20">
                  {unreadCount} New
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-30">
                  <Ghost size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Silence in the tent.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`relative group p-4 rounded-2xl border transition-all ${n.isRead ? "bg-[var(--bg-surface)]/30 border-transparent opacity-60" : "bg-[var(--bg)] border-[var(--border-color)] shadow-lg"}`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        n.type === "ROAST" ? "bg-orange-500/10 text-orange-500" :
                        n.type === "INVITE" ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {n.type === "ROAST" ? <Flame size={18} /> :
                         n.type === "INVITE" ? <Swords size={18} /> :
                         <Info size={18} />}
                      </div>
                      
                      <div className="flex-grow space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black truncate pr-4">{n.title}</h4>
                          <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-[var(--text-muted)] line-clamp-2">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link 
                            href={n.link} 
                            onClick={() => setIsOpen(false)}
                            className="inline-block pt-2 text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)] hover:underline"
                          >
                            Enter Arena <Swords size={10} className="inline ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Notification Actions */}
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {!n.isRead && (
                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[var(--brand-primary)] shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]" />
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-[var(--bg-surface)]/50 border-t border-[var(--border-color)]">
                <button 
                  onClick={async () => {
                    await fetch("/api/notifications/clear", { method: "POST" });
                    setNotifications([]);
                  }}
                  className="w-full py-2 rounded-xl border border-[var(--border-color)] text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={12} /> Mark All as Read & Clear
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
