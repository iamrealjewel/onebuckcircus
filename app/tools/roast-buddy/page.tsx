"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  Flame, Swords, Users, MessageSquare, Loader2, Send, 
  Sparkles, Trophy, Ghost, Zap, Crown, UserPlus, X,
  MessageCircle, Laugh, Bomb, Skull, Heart, RotateCcw,
  Settings, Trash2, Edit3, User as UserIcon, Shield, ChevronRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCircusDialog } from "@/components/CircusAlertProvider";

const CIRCUS_AVATARS = ["🤡", "👑", "🎪", "🦁", "🐘", "🎭", "🎩", "🤸", "🔮", "🔥"];
const CIRCUS_ROLES = [
  "Ringmaster", "The Heckler", "The Human Target", "Sad Clown", 
  "The Strongman", "Fortune Teller", "Trapeze Artist", "Bearded Lady"
];

const TEMPLATE_CATEGORIES = [
  { id: "brutal", label: "Brutal", icon: <Bomb size={14} /> },
  { id: "intellect", label: "Brainless", icon: <Skull size={14} /> },
  { id: "career", label: "Poverty", icon: <Ghost size={14} /> },
  { id: "savage", label: "Savage", icon: <Flame size={14} /> }
];

export default function RoastBuddyPage() {
  const { data: session } = useSession();
  const { showAlert } = useCircusDialog();
  const [friends, setFriends] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<any>({});
  const [activeTemplateCat, setActiveTemplateCat] = useState("brutal");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFriendsAndRooms();
    fetchAllTemplates();
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchFriendsAndRooms = async () => {
    try {
      const [friendsRes, roomsRes] = await Promise.all([
        fetch("/api/friends"),
        fetch("/api/roast/rooms")
      ]);
      const friendsData = await friendsRes.json();
      const roomsData = await roomsRes.json();
      setFriends(friendsData.friends || []);
      setRooms(roomsData.rooms || []);
      
      // Update active room data if it's currently open
      if (activeRoom) {
        const updated = roomsData.rooms.find((r: any) => r.id === activeRoom.id);
        if (updated) setActiveRoom(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTemplates = async () => {
    // In a real app, I'd fetch by category. For now, I'll generate a static set or fetch once.
    try {
      const res = await fetch("/api/roast/templates");
      const data = await res.json();
      // Distribute templates into categories for UI demo
      setTemplates({
        brutal: data.templates.slice(0, 2),
        intellect: data.templates.slice(2, 4),
        career: data.templates.slice(4, 5),
        savage: data.templates.slice(5)
      });
    } catch (err) {}
  };

  const pollData = async () => {
    fetchFriendsAndRooms();
    if (activeRoom) {
      fetchMessages(activeRoom.id);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/roast/rooms/${roomId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {}
  };

  const handleCreateRoom = async (friendId: string, friendName: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/roast/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: [friendId], name: `Duo Arena with ${friendName}` })
      });
      const data = await res.json();
      setActiveRoom(data.room);
      setMessages([]);
      showAlert("Arena Opened", "The Ringmaster has prepared the stage.");
    } catch (err) {
      showAlert("Error", "The arena gates are jammed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string, isTemplate = false) => {
    if (!content.trim() || !activeRoom || sending) return;
    setSending(true);
    try {
      await fetch(`/api/roast/rooms/${activeRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isTemplate })
      });
      setNewMessage("");
      fetchMessages(activeRoom.id);
    } catch (err) {
      showAlert("Error", "Roast failed to ignite.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;
    if (!confirm("Are you sure you want to dismantle this arena? All roasts will be lost.")) return;
    
    try {
      const res = await fetch(`/api/roast/rooms/${activeRoom.id}`, { method: "DELETE" });
      if (res.ok) {
        setActiveRoom(null);
        fetchFriendsAndRooms();
        showAlert("Arena Dismantled", "The circus moves on.");
      } else {
        const data = await res.json();
        showAlert("Forbidden", data || "Only the Ringmaster can do this.");
      }
    } catch (err) {}
  };

  const updateMember = async (memberId: string, data: any) => {
    try {
      const res = await fetch(`/api/roast/rooms/${activeRoom.id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchFriendsAndRooms();
      }
    } catch (err) {}
  };

  const myMembership = activeRoom?.members?.find((m: any) => m.userId === (session?.user as any).id);
  const isRingmaster = myMembership?.role === "Ringmaster";

  return (
    <main className="h-screen bg-[var(--bg)] pt-20 flex flex-col relative overflow-hidden text-[var(--text-main)]">
      <Navbar />
      
      <div className="flex-grow flex w-full mx-auto z-10 overflow-hidden">
        
        {/* SIDEBAR: Modern & Clean */}
        <div className="w-80 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)]/30 backdrop-blur-xl">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Crown size={20} className="text-[var(--brand-primary)]" /> Backstage
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-8">
            {/* Active Arenas */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Your Arenas</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[9px] font-black">{rooms.length}</span>
              </div>
              <div className="space-y-2">
                {rooms.map(room => (
                  <button 
                    key={room.id}
                    onClick={() => { setActiveRoom(room); fetchMessages(room.id); }}
                    className={`w-full group p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${activeRoom?.id === room.id ? "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/50 shadow-[0_10px_20px_rgba(var(--brand-primary-rgb),0.1)]" : "bg-[var(--bg)]/50 border-transparent hover:border-[var(--border-color)]"}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                      {room.members[0]?.avatar || "🤡"}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="text-xs font-black truncate">{room.name || "Arena"}</div>
                      <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-green-500" />
                         <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{room._count?.messages || 0} Insults</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`text-[var(--text-muted)] transition-transform ${activeRoom?.id === room.id ? "rotate-90 text-[var(--brand-primary)]" : ""}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Online Friends */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Online Performer</span>
              </div>
              <div className="space-y-2">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card)]/50 border border-[var(--border-color)] group hover:border-[var(--brand-primary)]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center text-xs font-black">
                          {friend.name?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg)]" />
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-[100px]">{friend.name}</span>
                    </div>
                    <button 
                      onClick={() => handleCreateRoom(friend.id, friend.name)}
                      className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-sm"
                      title="Challenge to Arena"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN ARENA */}
        <div className="flex-grow flex flex-col bg-[var(--bg)] relative overflow-hidden">
          {activeRoom ? (
            <>
              {/* ARENA HEADER */}
              <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/50 backdrop-blur-md flex items-center justify-between z-30 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-3">
                      {activeRoom.members.slice(0, 3).map((m: any) => (
                        <div key={m.id} className="w-10 h-10 rounded-xl border-2 border-[var(--bg)] bg-[var(--bg-card)] flex items-center justify-center text-xl shadow-lg" title={`${m.user.name} (${m.role})`}>
                          {m.avatar}
                        </div>
                      ))}
                   </div>
                   <div>
                      <h2 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
                        {activeRoom.name}
                        {isRingmaster && (
                          <button onClick={() => { setEditRoomName(activeRoom.name); setIsSettingsOpen(true); }} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--brand-primary)]">
                            <Edit3 size={14} />
                          </button>
                        )}
                      </h2>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><Users size={10} /> {activeRoom.members.length} Performers</span>
                        <span className="flex items-center gap-1 text-orange-500"><Flame size={10} /> Live Show</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest hover:border-[var(--brand-primary)] transition-all shadow-sm"
                   >
                     <Settings size={14} /> Backstage
                   </button>
                   {isRingmaster && (
                     <button 
                      onClick={handleDeleteRoom}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Dismantle Arena"
                     >
                       <Trash2 size={16} />
                     </button>
                   )}
                </div>
              </div>

              {/* CHAT AREA */}
              <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                       <Ghost size={80} className="mb-6 animate-pulse" />
                       <h3 className="text-3xl font-black uppercase italic italic">Empty Stage...</h3>
                       <p className="max-w-xs font-bold text-sm">Waiting for the first act. Don't be shy, let the insults fly.</p>
                    </div>
                 ) : (
                    messages.map((msg) => {
                      const sender = activeRoom.members.find((m: any) => m.userId === msg.senderId);
                      const isMe = msg.senderId === (session?.user as any).id;

                      return (
                        <div key={msg.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : ""}`}>
                          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--bg-card)] border-2 ${isMe ? "border-[var(--brand-primary)]" : "border-[var(--border-color)]"} flex items-center justify-center text-2xl shadow-lg relative`}>
                            {sender?.avatar || "🤡"}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[7px] font-black uppercase whitespace-nowrap shadow-sm">
                              {sender?.role || "Performer"}
                            </div>
                          </div>
                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[60%]`}>
                            <div className="flex items-center gap-2 mb-2 px-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{msg.senderName}</span>
                            </div>
                            <div className={`p-5 rounded-3xl relative shadow-2xl transition-transform hover:scale-[1.02] ${
                              isMe 
                                ? "bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-tr-none" 
                                : "bg-[var(--bg-card)] border border-[var(--border-color)] rounded-tl-none"
                            }`}>
                              {msg.isTemplate && (
                                <div className="absolute -top-3 -right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-[var(--brand-accent)] text-[var(--brand-accent)] animate-bounce-slow">
                                  <Sparkles size={14} />
                                </div>
                              )}
                              <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                              {msg.emoji && <span className="absolute -bottom-4 -right-4 text-3xl drop-shadow-2xl">{msg.emoji}</span>}
                            </div>
                            <span className="mt-2 text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })
                 )}
                 <div ref={chatEndRef} />
              </div>

              {/* ACTION CENTER: Templates & Input */}
              <div className="p-8 pt-0 bg-gradient-to-t from-[var(--bg)] to-transparent z-20">
                
                {/* IMPROVED TEMPLATE DRAWER */}
                <div className="card-glass border-[var(--border-color)] overflow-hidden mb-6 shadow-2xl">
                   <div className="flex bg-[var(--bg-surface)]/50 border-b border-[var(--border-color)]">
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setActiveTemplateCat(cat.id)}
                          className={`flex-grow flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTemplateCat === cat.id ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
                        >
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                   </div>
                   <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--bg-card)]/30 backdrop-blur-md">
                      {templates[activeTemplateCat]?.map((t: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => handleSendMessage(t, true)}
                          className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 text-left text-[10px] font-bold transition-all shadow-sm group relative"
                        >
                          <span className="line-clamp-2">{t}</span>
                          <div className="absolute inset-0 bg-[var(--brand-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                             <Flame size={16} className="text-[var(--brand-primary)]" />
                          </div>
                        </button>
                      ))}
                      <button 
                        onClick={fetchAllTemplates}
                        className="p-3 rounded-xl border border-dashed border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
                      >
                        <RotateCcw size={16} className="animate-hover" />
                      </button>
                   </div>
                </div>

                {/* INPUT BAR */}
                <div className="flex items-end gap-4 p-5 rounded-[40px] bg-[var(--bg-card)] border-2 border-[var(--border-color)] focus-within:border-[var(--brand-primary)] shadow-2xl transition-all">
                  <div className="flex items-center gap-3 mb-2 px-2 border-r border-[var(--border-color)] pr-4">
                    {["🔥", "🤡", "💀", "😂"].map(e => (
                      <button 
                        key={e} 
                        onClick={() => handleSendMessage(e, false, e)}
                        className="text-2xl hover:scale-150 active:scale-90 transition-transform drop-shadow-md"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(newMessage);
                      }
                    }}
                    placeholder="Whisper your burn into the void..."
                    className="flex-grow bg-transparent outline-none text-base font-bold py-3 resize-none max-h-32 placeholder:text-[var(--text-muted)]"
                    rows={1}
                  />
                  <button 
                    onClick={() => handleSendMessage(newMessage)}
                    disabled={sending || !newMessage.trim()}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-[var(--brand-primary)]/30 group"
                  >
                    {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 space-y-12 bg-gradient-to-b from-[var(--bg)] to-[var(--bg-surface)]">
               <div className="relative">
                  <div className="w-48 h-48 rounded-[64px] bg-[var(--brand-primary)]/5 border-2 border-dashed border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)] animate-float">
                    <Crown size={96} className="opacity-20" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[var(--brand-accent)]/10 flex items-center justify-center animate-bounce-slow">
                    <Ghost size={48} className="text-[var(--brand-accent)] opacity-30" />
                  </div>
               </div>
               <div className="text-center max-w-lg space-y-4">
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-gradient">Arena Doors Closed</h2>
                  <p className="text-xl font-bold text-[var(--text-muted)] leading-relaxed">
                    Select a battle from the sidebar or summon a victim to begin the legendary roasting ritual.
                  </p>
               </div>
               <div className="flex gap-6">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                    <Shield size={20} className="text-[var(--brand-primary)]" />
                    <span className="text-xs font-black uppercase tracking-widest">Secure Roasting</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl animate-in slide-in-from-bottom-8 duration-500">
                    <Sparkles size={20} className="text-[var(--brand-accent)]" />
                    <span className="text-xs font-black uppercase tracking-widest">AI Assistance</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS MODAL: Clean & Practical */}
      {isSettingsOpen && activeRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/40">
           <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] shadow-inner">
                       <Settings size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tighter">BACKSTAGE CONTROLS</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Customize your arena persona</p>
                    </div>
                 </div>
                 <button onClick={() => setIsSettingsOpen(false)} className="w-10 h-10 rounded-full border border-[var(--border-color)] flex items-center justify-center hover:bg-white/10 transition-all">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 {/* Room Name (Ringmaster Only) */}
                 {isRingmaster && (
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                         <Edit3 size={12} /> Arena Designation
                      </label>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={editRoomName}
                          onChange={(e) => setEditRoomName(e.target.value)}
                          className="flex-grow p-4 rounded-2xl bg-[var(--bg)] border-2 border-[var(--border-color)] focus:border-[var(--brand-primary)] font-bold outline-none"
                        />
                        <button 
                          onClick={async () => {
                            await fetch(`/api/roast/rooms/${activeRoom.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name: editRoomName })
                            });
                            fetchFriendsAndRooms();
                            showAlert("Designation Updated", "The arena has a new name.");
                          }}
                          className="btn-primary px-8"
                        >
                          Update
                        </button>
                      </div>
                   </div>
                 )}

                 {/* My Persona */}
                 <div className="p-6 rounded-3xl bg-[var(--bg)] border border-[var(--border-color)] space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]">Your Persona</h4>
                       <span className="px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[9px] font-black uppercase tracking-widest border border-[var(--brand-primary)]/20">
                          {myMembership?.role}
                       </span>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-[var(--text-muted)]">Select your circus avatar for this room:</p>
                       <div className="grid grid-cols-5 gap-3">
                          {CIRCUS_AVATARS.map(ava => (
                            <button 
                              key={ava}
                              onClick={() => updateMember(myMembership.id, { avatar: ava })}
                              className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl transition-all shadow-sm ${myMembership?.avatar === ava ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 scale-110 shadow-lg shadow-[var(--brand-primary)]/20" : "border-[var(--border-color)] hover:border-[var(--text-muted)]"}`}
                            >
                              {ava}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-[var(--text-muted)]">Change your role in the show:</p>
                       <div className="flex flex-wrap gap-2">
                          {CIRCUS_ROLES.map(role => (
                            <button 
                              key={role}
                              onClick={() => updateMember(myMembership.id, { role })}
                              className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${myMembership?.role === role ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg" : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"}`}
                            >
                              {role}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Other Performers (Ringmaster can change their roles) */}
                 {isRingmaster && (
                   <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Managed Performers</h4>
                      <div className="space-y-3">
                        {activeRoom.members.filter((m: any) => m.userId !== (session?.user as any).id).map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-color)]">
                             <div className="flex items-center gap-3">
                                <span className="text-2xl">{m.avatar}</span>
                                <div>
                                   <div className="text-[10px] font-black truncate">{m.user.name}</div>
                                   <div className="text-[8px] font-bold text-[var(--brand-primary)] uppercase">{m.role}</div>
                                </div>
                             </div>
                             <select 
                               value={m.role} 
                               onChange={(e) => updateMember(m.id, { role: e.target.value })}
                               className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[9px] font-black p-2 outline-none"
                             >
                               {CIRCUS_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                             </select>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="p-8 bg-[var(--bg-surface)]/50 border-t border-[var(--border-color)]">
                 <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 rounded-2xl bg-[var(--brand-primary)] text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand-primary)]/20">
                    Done
                 </button>
              </div>
           </div>
        </div>
      )}
    </main>
  );
}

function handleSendMessage(content: string, isTemplate = false, emoji?: string) {
  // Logic inside the component
}
