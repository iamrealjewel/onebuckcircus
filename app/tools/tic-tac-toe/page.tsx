"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { X, Circle, RotateCcw, MessageSquare, Loader2, UserPlus, Swords, Trophy, Ghost, Flame, ShieldAlert, Sparkles, XCircle, CheckCircle2, HandMetal, Skull, Zap, ChevronRight, Ban, Play, Star, Info, ArrowLeft, Search, UserSearch, Medal, Target, TrendingUp, History as HistoryIcon, LayoutGrid, Award, Calendar, ArrowUp, ArrowDown, Minus, Filter, ShieldCheck, UserCircle, UserCog } from "lucide-react";
import { aiGetTicTacToeMove, generateAccessRoast, aiGetDuelRoast } from "@/app/actions/acts";
import { useSession } from "next-auth/react";
import { useCircusDialog } from "@/components/CircusAlertProvider";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// --- THEME ---
const THEME = { crimson: "#8b0000", gold: "#ffd700", accent: "#ff3cac", blue: "#00d4ff" };

// --- 3D UNITY AVATARS ---
const AVATARS = [
  { id: 'warlord', name: 'Iron Warlord', src: '/avatars/viking/warlord.png', type: 'MALE' },
  { id: 'shieldmaiden', name: 'Shieldmaiden', src: '/avatars/viking/shieldmaiden.png', type: 'FEMALE' },
  { id: 'berserker', name: 'Berserker', src: '/avatars/viking/berserker.png', type: 'MALE' },
  { id: 'valkyrie', name: 'Valkyrie', src: '/avatars/viking/valkyrie.png', type: 'FEMALE' },
];

// --- TIER CALCULATOR ---
const getTier = (points: number) => {
  if (points >= 1001) return { name: "Diamond", color: "#b9f2ff", icon: <Trophy size={16} className="text-blue-200" />, shadow: "0 0 30px rgba(185,242,255,0.4)" };
  if (points >= 601) return { name: "Platinum", color: "#e5e4e2", icon: <Star size={16} className="text-gray-300" />, shadow: "0 0 25px rgba(229,228,226,0.3)" };
  if (points >= 301) return { name: "Gold", color: "#ffd700", icon: <Medal size={16} className="text-yellow-500" />, shadow: "0 0 20px rgba(255,215,0,0.3)" };
  if (points >= 101) return { name: "Silver", color: "#c0c0c0", icon: <ShieldAlert size={16} className="text-gray-400" />, shadow: "0 0 15px rgba(192,192,192,0.2)" };
  return { name: "Bronze", color: "#cd7f32", icon: <Skull size={16} className="text-amber-700" />, shadow: "none" };
};

// --- UNITY 3D ANIMATED AVATAR ---
const UnityAvatar = ({ avatarId, action, name, points = 0, isFlipped = false, isActive = false, isWinner = false }: any) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const tier = getTier(points);

  return (
    <div className={`flex flex-col items-center gap-8 transition-all duration-1000 perspective-1000 ${isActive ? 'scale-105' : 'opacity-60 grayscale-[0.5]'}`}>
      <div className={`relative w-[360px] h-[480px] transition-all duration-700 ${isFlipped ? '-scale-x-100' : ''}`}>
        <div className={`absolute inset-10 bg-black/40 blur-3xl rounded-full opacity-60`} />
        {isActive && <div className="absolute inset-[-60px] bg-[var(--brand-primary)]/20 blur-[120px] rounded-full animate-pulse" />}
        {isWinner && <div className="absolute -top-24 left-1/2 -translate-x-1/2 animate-bounce z-50"><Medal size={120} className="text-yellow-500 drop-shadow-[0_0_50px_rgba(255,215,0,0.8)]" /></div>}

        <div className={`w-full h-full relative z-10 transition-all duration-500 
           ${isActive ? 'animate-viking-breathing' : ''} 
           ${action === 'attack' ? 'animate-viking-strike' : ''} 
           ${action === 'kneel' ? 'scale-y-75 translate-y-24 opacity-80' : ''}
           ${action === 'victory' ? 'animate-bounce' : ''}`}>
           <img src={avatar.src} alt={name} className="w-full h-full object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.9)] select-none pointer-events-none" />
        </div>
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-48 h-12 bg-black/50 blur-2xl rounded-full scale-x-150 opacity-40" />
      </div>

      <div className="flex flex-col items-center gap-3 z-20">
         <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-black/80 border border-white/20 backdrop-blur-2xl shadow-2xl">
            <span style={{ color: tier.color }} className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">{tier.icon} {tier.name}</span>
         </div>
         <div className={`px-12 py-5 rounded-[35px] border-2 bg-black/70 backdrop-blur-3xl text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${isActive ? 'border-yellow-500 scale-105 shadow-[0_0_40px_rgba(255,215,0,0.3)]' : 'border-white/10'}`}>
            <span className="text-xl font-black uppercase tracking-[0.25em] text-white italic drop-shadow-lg">{name}</span>
         </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function TicTacToePage() {
  const { data: session } = useSession();
  const { showAlert } = useCircusDialog();
  const searchParams = useSearchParams();
  const router = useRouter();
  const duelId = searchParams.get("duelId");

  const [phase, setPhase] = useState<'MODE' | 'WAITING' | 'BATTLE'>('MODE');
  const [selectedAvatarId, setSelectedAvatarId] = useState('warlord');
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [mode, setMode] = useState<'ORACLE' | 'DUEL'>('ORACLE');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [offcanvasTab, setOffcanvasTab] = useState<'HISTORY' | 'LOCAL' | 'GLOBAL'>('HISTORY');
  
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [visualBoard, setVisualBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [activeRoasts, setActiveRoasts] = useState<{ id: number, text: string }[]>([]);
  const [turnRoast, setTurnRoast] = useState("It is time to strike!");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [duelData, setDuelData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [historyFilters, setHistoryFilters] = useState({ startDate: "", endDate: "", opponentId: "" });
  
  // REAL-TIME STATS STATE
  const [liveStats, setLiveStats] = useState<any>(null);

  const [leftAction, setLeftAction] = useState<'idle' | 'attack' | 'victory' | 'defeat' | 'kneel'>('idle');
  const [rightAction, setRightAction] = useState<'idle' | 'attack' | 'victory' | 'defeat' | 'kneel'>('idle');

  const userId = (session?.user as any)?.id;
  const boardRef = useRef(board);
  useEffect(() => { boardRef.current = board; }, [board]);

  const addRoast = useCallback((text: string) => {
    setActiveRoasts(prev => [...prev, { id: Date.now(), text }]);
  }, []);

  const fetchLiveStats = useCallback(async () => {
    try {
      const res = await fetch("/api/duel/tic-tac-toe/stats");
      if (res.ok) setLiveStats(await res.json());
    } catch (err) {}
  }, []);

  useEffect(() => { fetchLiveStats(); }, [fetchLiveStats]);

  // PERSISTENT AVATAR INITIALIZATION
  useEffect(() => {
    if ((session?.user as any)?.preferredAvatar) {
      setSelectedAvatarId((session.user as any).preferredAvatar);
    }
  }, [session]);

  const handleAvatarSelect = async (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    setIsArmoryOpen(false);
    try {
      await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId }),
      });
    } catch (err) {
      console.error("Failed to save avatar preference:", err);
    }
  };

  // Poll for Duel State (Hardened)
  useEffect(() => {
    if (!duelId) return;
    const fetchDuel = async () => {
      try {
        const res = await fetch(`/api/duel/tic-tac-toe?duelId=${duelId}`);
        if (res.ok) {
          const data = await res.json();
          if (!data) return;
          if (data.status === 'REJECTED') { showAlert("Summons Rejected."); router.push('/tools/tic-tac-toe'); return; }
          if (data.status === 'PENDING') setPhase('WAITING');
          if (data.status === 'ACTIVE' || data.status === 'COMPLETED') { setPhase('BATTLE'); setMode('DUEL'); }

          const remoteBoard = data.board ? data.board.split(",").map((s: string) => s === "null" ? null : s) : Array(9).fill(null);
          const isBoardEqual = JSON.stringify(remoteBoard) === JSON.stringify(boardRef.current);
          
          if (!isBoardEqual) {
             const remoteMoveCount = remoteBoard.filter((s: any) => s !== null).length;
             const localMoveCount = boardRef.current.filter(s => s !== null).length;
             if (remoteMoveCount > localMoveCount) {
                const lastMoverId = data.turnId === data.player1Id ? data.player2Id : data.player1Id;
                if (lastMoverId !== userId) {
                   if (lastMoverId === data.player1Id) { setLeftAction('attack'); setTimeout(() => setLeftAction('idle'), 800); }
                   else { setRightAction('attack'); setTimeout(() => setRightAction('idle'), 800); }
                   setTimeout(() => { setVisualBoard(remoteBoard); setBoard(remoteBoard); }, 400);
                } else { setVisualBoard(remoteBoard); setBoard(remoteBoard); }
             } else { setVisualBoard(remoteBoard); setBoard(remoteBoard); }
          }

          setDuelData(data);
          if (data.status === 'COMPLETED' && !winner) {
             const winSym = data.winnerId === data.player1Id ? "X" : data.winnerId === data.player2Id ? "O" : "draw";
             setWinner(winSym);
             if (winSym === 'X') { setLeftAction('victory'); setRightAction('kneel'); } 
             else if (winSym === 'O') { setRightAction('victory'); setLeftAction('kneel'); }
             else { setLeftAction('idle'); setRightAction('idle'); }
             setIsPlayerTurn(false);
             fetchLiveStats(); // REFRESH GLORY POINTS
             return;
          }
          setIsPlayerTurn(data.turnId === userId && data.status === "ACTIVE");
        }
      } catch (err) {}
    };
    const interval = setInterval(fetchDuel, 1500);
    return () => clearInterval(interval);
  }, [duelId, userId, router, showAlert, winner, fetchLiveStats]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/friends");
        const data = await res.json();
        setFriends(data.friends || []);
      } catch (err) {}
    };
    fetchFriends();
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams(historyFilters as any);
      const res = await fetch(`/api/duel/tic-tac-toe/history?${params.toString()}`);
      if (res.ok) setHistory(await res.json());
    } catch (err) {}
  }, [historyFilters]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/duel/tic-tac-toe/leaderboard");
      if (res.ok) setLeaderboard(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
     if (isOffcanvasOpen) {
        if (offcanvasTab === 'HISTORY') fetchHistory();
        if (offcanvasTab === 'GLOBAL') fetchLeaderboard();
     }
  }, [isOffcanvasOpen, offcanvasTab, fetchHistory]);

  const currentStats = liveStats || {
     points: (session?.user as any)?.points || 0,
     wins: (session?.user as any)?.wins || 0,
     losses: (session?.user as any)?.losses || 0,
     name: session?.user?.name || "Gladiator"
  };

  const handleSquareClick = async (index: number) => {
    if (board[index] || winner || !isPlayerTurn || loading) return;
    const mySym = duelId ? (userId === duelData?.player1Id ? "X" : "O") : "X";
    const newBoard = [...board];
    newBoard[index] = mySym;
    setBoard(newBoard);
    
    if (mySym === 'X') { setLeftAction('attack'); setTimeout(() => setLeftAction('idle'), 800); }
    else { setRightAction('attack'); setTimeout(() => setRightAction('idle'), 800); }
    
    setTimeout(() => { const vBoard = [...visualBoard]; vBoard[index] = mySym; setVisualBoard(vBoard); }, 400);

    if (duelId) {
      setLoading(true);
      try {
        const res = await fetch("/api/duel/tic-tac-toe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "UPDATE", duelId, board: newBoard }) });
        const updated = await res.json();
        if (updated.status === 'COMPLETED') {
           const winSym = updated.winnerId === updated.player1Id ? "X" : updated.winnerId === updated.player2Id ? "O" : "draw";
           setWinner(winSym);
           fetchLiveStats(); // REFRESH GLORY POINTS
        } else { setIsPlayerTurn(false); }
      } catch (err) {} finally { setLoading(false); }
      return;
    }

    // ORACLE
    setIsPlayerTurn(false); setLoading(true);
    try {
      const aiResponse = await aiGetTicTacToeMove(newBoard);
      const aiBoard = [...newBoard];
      const move = aiResponse.moveIndex;
      if (move >= 0 && aiBoard[move] === null) {
        aiBoard[move] = "O";
        setTimeout(() => {
           setRightAction('attack');
           setTimeout(() => { const vBoard = [...visualBoard]; vBoard[index] = "X"; vBoard[move] = "O"; setVisualBoard(vBoard); }, 400);
           setTimeout(() => setRightAction('idle'), 800);
           addRoast(aiResponse.trashTalk);
        }, 800);
      }
      setBoard(aiBoard);
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      let finalWin = null;
      for (let l of lines) { const [a,b,c] = l; if (aiBoard[a] && aiBoard[a] === aiBoard[b] && aiBoard[a] === aiBoard[c]) finalWin = aiBoard[a]; }
      if (!finalWin && aiBoard.filter(s => s !== null).length === 9) finalWin = "draw";

      if (finalWin) { 
         setTimeout(() => {
            setWinner(finalWin); 
            if (finalWin === 'O') { setRightAction('victory'); setLeftAction('kneel'); } 
            else if (finalWin === 'X') { setLeftAction('victory'); setRightAction('kneel'); }
         }, 1600);
      } 
      else { setTimeout(() => { setIsPlayerTurn(true); setTurnRoast("BACK TO YOU, CLOWN!"); }, 1600); }
    } catch (err) {} finally { setLoading(false); }
  };

  const handleChallenge = async (email: string) => {
    try {
      const res = await fetch("/api/friends/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, actId: "tic-tac-toe" }) });
      const data = await res.json();
      if (res.ok) { router.push(`/tools/tic-tac-toe?duelId=${data.duelId}`); setPhase('WAITING'); }
    } catch (err) {}
  };

  const handleAcceptReject = async (action: 'ACCEPT' | 'REJECT') => {
    const currentDuelId = duelId || duelData?.id;
    if (!currentDuelId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/duel/tic-tac-toe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, duelId: currentDuelId }) });
      if (res.ok) { if (action === 'REJECT') { router.push('/tools/tic-tac-toe'); setPhase('MODE'); } else { setPhase('BATTLE'); setMode('DUEL'); } }
    } catch (err) {} finally { setLoading(false); }
  };

  const isBalling = phase === 'BATTLE';
  const isUserP1 = userId === duelData?.player1Id || !duelId;
  const p1 = { ...currentStats, avatarId: selectedAvatarId };
  const p2 = mode === 'ORACLE' ? { name: "The Oracle", points: 2000, avatarId: 'warlord' } : (duelData?.player2 || { name: "Opponent", points: 0, avatarId: 'shieldmaiden' });
  const p1Avatar = isUserP1 ? selectedAvatarId : (duelData?.player1?.preferredAvatar || 'warlord');
  const p2Avatar = !isUserP1 ? selectedAvatarId : (mode === 'ORACLE' ? 'warlord' : (duelData?.player2?.preferredAvatar || 'shieldmaiden'));
  const iWon = winner === (isUserP1 ? "X" : "O");
  const iLost = winner && winner !== "draw" && !iWon;
  const isDraw = winner === "draw";
  const myTier = getTier(currentStats.points);
  const filteredFriends = friends.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const localRanking = [...friends, { ...currentStats, id: userId }].sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col overflow-y-auto relative transition-all duration-500">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--brand-primary)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand-secondary)]/10 blur-[100px] rounded-full" />
      </div>

      {activeRoasts.map(r => <RoastPopup key={r.id} text={r.text} onComplete={() => setActiveRoasts(prev => prev.filter(p => p.id !== r.id))} />)}

      {/* ARMORY MODAL (The Tactical Grid) */}
      {isArmoryOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsArmoryOpen(false)} />
           <div className="relative w-full max-w-5xl bg-[var(--bg-card)] border-4 border-white/10 rounded-[60px] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-2">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter">Select Your Warlord</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">High-fidelity 3D armory for the arena</p>
                 </div>
                 <button onClick={() => setIsArmoryOpen(false)} className="p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all"><X size={32} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {AVATARS.map(avatar => (
                    <div key={avatar.id} onClick={() => handleAvatarSelect(avatar.id)} className={`group relative cursor-pointer card-glass p-6 rounded-[40px] border-4 transition-all duration-500 ${selectedAvatarId === avatar.id ? 'border-yellow-500 scale-105 shadow-[0_0_50px_rgba(255,215,0,0.3)]' : 'border-white/5 hover:border-white/20'}`}>
                       <div className="h-64 w-full relative mb-6">
                          <img src={avatar.src} alt={avatar.name} className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div className="text-center">
                          <h4 className="text-lg font-black uppercase italic text-white mb-1">{avatar.name}</h4>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">{avatar.type} Warrior</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* GRAND LEDGER OFFCANVAS (50% Width) */}
      <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOffcanvasOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
           <div className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-700 ${isOffcanvasOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsOffcanvasOpen(false)} />
           <div className={`relative w-full md:w-1/2 bg-[var(--bg-card)] border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOffcanvasOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-8 border-b border-white/10">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Gladiator's Grand Ledger</h2>
                    <button onClick={() => setIsOffcanvasOpen(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-[var(--brand-primary)] hover:text-white transition-all"><X size={24} /></button>
                 </div>
                 <div className="flex bg-black/40 p-1.5 rounded-2xl gap-2">
                    {['HISTORY', 'LOCAL', 'GLOBAL'].map(tab => (
                       <button key={tab} onClick={() => setOffcanvasTab(tab as any)} className={`flex-grow py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${offcanvasTab === tab ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}>
                          {tab}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                 {offcanvasTab === 'HISTORY' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Opponent</label>
                             <select value={historyFilters.opponentId} onChange={e => setHistoryFilters(prev => ({...prev, opponentId: e.target.value}))} className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                                <option value="">All Rivals</option>
                                {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Start Date</label>
                             <input type="date" value={historyFilters.startDate} onChange={e => setHistoryFilters(prev => ({...prev, startDate: e.target.value}))} className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">End Date</label>
                             <input type="date" value={historyFilters.endDate} onChange={e => setHistoryFilters(prev => ({...prev, endDate: e.target.value}))} className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                          </div>
                       </div>
                       {history.map(h => {
                          const opponent = h.player1Id === userId ? h.player2 : h.player1;
                          const result = h.winnerId === userId ? 'WIN' : h.winnerId === null ? 'DRAW' : 'LOSS';
                          return (
                             <div key={h.id} className={`p-8 rounded-[40px] border flex items-center justify-between ${result === 'WIN' ? 'border-yellow-500/20 bg-yellow-500/5' : result === 'LOSS' ? 'border-red-500/20 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                                <div className="flex items-center gap-6">
                                   <div className="text-center bg-black/40 p-4 rounded-3xl border border-white/5 min-w-[90px]">
                                      <div className="text-xl font-black">{new Date(h.updatedAt).getDate()}</div>
                                      <div className="text-[10px] font-bold uppercase opacity-60">{new Date(h.updatedAt).toLocaleString('default', { month: 'short' })}</div>
                                   </div>
                                   <div>
                                      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">VS {opponent.name}</div>
                                      <div className={`text-3xl font-black italic ${result === 'WIN' ? 'text-yellow-500' : result === 'LOSS' ? 'text-red-500' : 'text-blue-400'}`}>{result}</div>
                                   </div>
                                </div>
                                {result === 'WIN' ? <Trophy size={48} className="text-yellow-500 opacity-20" /> : result === 'LOSS' ? <Skull size={48} className="text-red-500 opacity-20" /> : <HandMetal size={48} className="text-blue-400 opacity-20" />}
                             </div>
                          );
                       })}
                    </div>
                 )}
                 {offcanvasTab === 'LOCAL' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                       {localRanking.map((u, i) => {
                          const tier = getTier(u.points || 0);
                          const isMe = u.id === userId;
                          return (
                             <div key={u.id} className={`flex items-center justify-between p-8 rounded-[40px] border transition-all ${isMe ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-white/5'}`}>
                                <div className="flex items-center gap-6">
                                   <div className={`text-3xl font-black w-10 ${i === 0 ? 'text-yellow-500' : 'text-[var(--text-muted)]'}`}>#{i + 1}</div>
                                   <div className="w-16 h-16 rounded-3xl bg-[var(--bg-surface)] flex items-center justify-center text-2xl font-black shadow-xl">{u.name?.[0].toUpperCase()}</div>
                                   <div>
                                      <div className="font-black text-white text-xl flex items-center gap-2">{u.name} {isMe && <span className="text-[8px] bg-[var(--brand-primary)] px-2 py-0.5 rounded-full">YOU</span>}</div>
                                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{tier.name} Raider</div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-3xl font-black text-yellow-500">{u.points || 0}</div>
                                   <div className="text-[10px] font-bold uppercase opacity-40">Glory</div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 )}
                 {offcanvasTab === 'GLOBAL' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                       {leaderboard.map((u, i) => {
                          const tier = getTier(u.points);
                          return (
                             <div key={u.id} className="flex items-center justify-between p-8 rounded-[40px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className="flex flex-col items-center w-12">
                                      <div className={`text-3xl font-black ${i < 3 ? 'text-yellow-500' : 'text-[var(--text-muted)]'}`}>#{i + 1}</div>
                                      <div className="mt-1">
                                         {u.shift > 0 ? <ArrowUp size={16} className="text-green-500 animate-bounce" /> : u.shift < 0 ? <ArrowDown size={16} className="text-red-500 animate-bounce" /> : <Minus size={16} className="text-gray-600" />}
                                      </div>
                                   </div>
                                   <div className="w-16 h-16 rounded-3xl bg-[var(--bg-surface)] flex items-center justify-center text-2xl font-black shadow-xl">{u.name?.[0].toUpperCase()}</div>
                                   <div>
                                      <div className="font-black text-white text-xl">{u.name}</div>
                                      <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: tier.color }}>{tier.name} Warlord</div>
                                   </div>
                                </div>
                                <div className="flex gap-10">
                                   <div className="text-center">
                                      <div className="text-3xl font-black text-yellow-500">{u.points}</div>
                                      <div className="text-[10px] font-bold uppercase opacity-40">Glory</div>
                                   </div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 )}
              </div>
           </div>
      </div>

      <header className={`relative z-10 transition-all duration-1000 ease-in-out px-10 text-center space-y-4 ${isBalling ? 'h-0 opacity-0 -translate-y-full overflow-hidden' : 'pt-24 pb-6'}`}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
             <Swords size={14} className="text-[var(--brand-primary)]" /> The Arena Spectacle
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase leading-none px-4 overflow-visible">
             The <span className="gradient-text italic pr-8">Gambit</span>
          </h1>
      </header>

      <div className={`flex-grow flex flex-col items-center relative z-10 w-full px-4 md:px-12 ${isBalling ? 'h-full pt-24' : ''}`}>
         
          {/* PHASE: MODE */}
          {phase === 'MODE' && !duelId && (
            <div className="w-full flex flex-col gap-10 animate-in fade-in zoom-in duration-700 pb-20">
               
               {/* UNIFIED COMMAND CONSOLE (Full-Width) */}
               <div className="relative group w-full">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/10 via-[var(--brand-primary)]/10 to-yellow-500/10 rounded-[50px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative card-glass p-10 rounded-[50px] border-2 border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden flex flex-col lg:flex-row items-center gap-12">
                     
                     {/* SECTION 1: THE WARRIOR */}
                     <div className="flex flex-col md:flex-row items-center gap-8 lg:w-1/2">
                        <div className="relative cursor-pointer group/avatar" onClick={() => setIsArmoryOpen(true)}>
                           <div className="w-40 h-40 rounded-[40px] bg-[var(--bg-surface)] border-2 border-white/10 flex items-center justify-center relative z-10 overflow-hidden shadow-2xl transition-all group-hover/avatar:scale-105 group-hover/avatar:border-yellow-500">
                              <img src={AVATARS.find(a => a.id === selectedAvatarId)?.src} alt="avatar" className="w-full h-full object-contain animate-viking-breathing scale-125" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                 <UserCog size={32} className="text-yellow-500 mb-1 animate-spin" />
                                 <span className="text-[8px] font-black uppercase">Change</span>
                              </div>
                           </div>
                           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-500 text-black text-[8px] font-black uppercase italic tracking-widest shadow-xl whitespace-nowrap z-20">
                              Active Warrior
                           </div>
                        </div>
                        <div className="text-center md:text-left">
                           <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-1 text-white leading-none pr-4">{currentStats.name}</h3>
                           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)] mb-6">Master of {AVATARS.find(a => a.id === selectedAvatarId)?.name}</p>
                           <div className="flex flex-wrap justify-center md:justify-start gap-4">
                              <button onClick={() => setIsOffcanvasOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase italic text-[9px] tracking-widest hover:bg-white/10 transition-all">
                                 <HistoryIcon size={14} /> View Ledger
                              </button>
                              <button onClick={() => setIsArmoryOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase italic text-[9px] tracking-widest hover:bg-white/10 transition-all">
                                 <LayoutGrid size={14} /> Armory
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* VERTICAL SEPARATOR */}
                     <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                     {/* SECTION 2: THE GLORY */}
                     <div className="flex flex-col md:flex-row items-center gap-12 lg:w-1/2 justify-between">
                        <div className="flex flex-col items-center md:items-start">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                                 {myTier.icon}
                              </div>
                              <div>
                                 <div className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-0.5">Glory Tier</div>
                                 <h4 className="text-2xl font-black uppercase italic tracking-tight text-white">{myTier.name} Raider</h4>
                              </div>
                           </div>
                           <div className="w-64">
                              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                                 <span>Ascension Progress</span>
                                 <span>{Math.round((currentStats.points % 300) / 3)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                 <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full" style={{ width: `${(currentStats.points % 300) / 3}%` }} />
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           <div className="text-center">
                              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">Combat Points</div>
                              <div className="text-5xl font-black text-yellow-500 drop-shadow-lg">{currentStats.points}</div>
                           </div>
                           <div className="text-center">
                              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">Global Rank</div>
                              <div className="text-5xl font-black text-white drop-shadow-lg">#{localRanking.findIndex(u => u.id === userId) + 1}</div>
                           </div>
                        </div>
                     </div>

                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] animate-[shimmer_4s_infinite]" />
                  </div>
               </div>

               {/* BATTLE GRID (Victims & Oracle) */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* RIGHT COLUMN: THE WAR MAP */}
                  <div className="lg:col-span-8 flex flex-col gap-8">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <div className="space-y-1 text-left">
                           <h4 className="text-4xl font-black uppercase italic tracking-tighter">Victim Registry</h4>
                           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">Select a rival to summon to the arena</p>
                        </div>
                        <div className="relative w-full md:w-80">
                           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                           <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search victims..." className="w-full bg-black/40 border-2 border-white/10 rounded-3xl pl-14 pr-6 py-4 focus:border-yellow-500 outline-none font-bold text-sm transition-all" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                        {filteredFriends.map(f => {
                           const ft = getTier(f.points || 0);
                           return (
                             <div key={f.id} onClick={() => handleChallenge(f.email)} className="group card-glass p-8 rounded-[50px] border-4 border-white/5 hover:border-yellow-500 transition-all cursor-pointer shadow-xl flex items-center gap-8 relative overflow-hidden group-hover:z-50">
                                <div className="w-20 h-20 rounded-[30px] bg-[var(--bg-surface)] border-2 border-white/10 flex items-center justify-center text-3xl font-black shrink-0">
                                   {f.name?.[0].toUpperCase()}
                                </div>
                                <div className="flex-grow">
                                   <h5 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">{f.name}</h5>
                                   <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: ft.color }}>{ft.icon} {ft.name}</div>
                                      <div className="text-[10px] font-black uppercase tracking-widest text-yellow-500">{f.points || 0} Glory</div>
                                   </div>
                                </div>
                             </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* SIDE COLUMN: THE ORACLE */}
                  <div className="lg:col-span-4 flex flex-col gap-8">
                     <h4 className="text-4xl font-black uppercase italic tracking-tighter px-4 text-left">Face The Oracle</h4>
                     <div onClick={() => setMode('ORACLE')} className="group cursor-pointer card-glass p-10 rounded-[50px] border-4 border-dashed border-white/10 hover:border-blue-500 transition-all shadow-2xl flex flex-col items-center justify-center text-center flex-grow bg-blue-500/5">
                        <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
                        <h5 className="text-3xl font-black uppercase italic mb-2 text-white">The Oracle</h5>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8">Test your blades against the machine. Infinite practice, infinite roasts.</p>
                        <div className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.3em] group-hover:bg-blue-500 group-hover:text-white transition-all">Enter Practice Arena</div>
                     </div>
                  </div>
               </div>
            </div>
          )}

         {/* PHASE: BATTLE */}
         {phase === 'BATTLE' && (
            <div className="w-full h-full flex items-center justify-between gap-6 max-w-[1700px] animate-in fade-in duration-1000 relative">
               <UnityAvatar avatarId={p1Avatar} action={leftAction} name={p1.name} points={p1.points} isActive={isPlayerTurn} isWinner={winner === "X"} />
               
               <div className="relative flex flex-col items-center gap-8 flex-grow">
                  {!winner && (
                    <div className={`px-12 py-5 rounded-[40px] bg-black/60 border-t-4 ${isPlayerTurn ? 'border-t-yellow-500 shadow-[0_0_60px_rgba(255,215,0,0.4)] animate-pulse' : 'border-t-white/10 opacity-60'} backdrop-blur-3xl transition-all`}>
                       <span className={`text-2xl font-black uppercase italic tracking-widest ${isPlayerTurn ? 'text-yellow-500' : 'text-white'}`}>{isPlayerTurn ? turnRoast : `Waiting for Opponent...`}</span>
                    </div>
                  )}
                  <div className="p-6 rounded-[70px] bg-black/40 border-4 border-white/10 shadow-2xl backdrop-blur-md scale-110">
                     <div className="grid grid-cols-3 gap-8 p-10 rounded-[60px] bg-[var(--bg-card)] border-4 border-[var(--border-color)]">
                        {visualBoard.map((sq, i) => (
                           <button key={i} onClick={() => handleSquareClick(i)} disabled={!!sq || !!winner || !isPlayerTurn || loading} className="w-36 h-36 rounded-[40px] flex items-center justify-center relative group border-4 border-[var(--border-color)] hover:border-yellow-500 transition-all shadow-xl bg-black/20">
                              {sq === 'X' && <X size={90} strokeWidth={10} className="text-yellow-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] animate-in zoom-in spin-in-45 duration-300" />}
                              {sq === 'O' && <Circle size={80} strokeWidth={10} className="text-[var(--brand-primary)] drop-shadow-[0_0_30px_rgba(255,60,172,0.6)] animate-in zoom-in duration-300" />}
                           </button>
                        ))}
                     </div>
                  </div>
                  {winner && (
                     <div className="absolute inset-[-40px] z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl rounded-[80px] animate-in zoom-in duration-500 border-8 border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]">
                        {iWon && <Trophy size={140} className="text-yellow-500 mb-8 animate-bounce drop-shadow-[0_0_60px_rgba(255,215,0,0.6)]" />}
                        {iLost && <Skull size={140} className="text-red-500 mb-8 animate-pulse drop-shadow-[0_0_60px_rgba(239,68,68,0.6)]" />}
                        {isDraw && <HandMetal size={140} className="text-blue-400 mb-8 animate-bounce drop-shadow-[0_0_60px_rgba(96,165,250,0.6)]" />}
                        <div className="text-center space-y-4 mb-16">
                           <h2 className={`text-8xl font-black italic uppercase tracking-tighter ${iWon ? 'text-yellow-500' : iLost ? 'text-red-500' : 'text-blue-400'}`}>
                              {iWon ? 'LEGENDARY VICTORY!' : iLost ? 'SLAUGHTERED!' : 'STALEMATE!'}
                           </h2>
                           <p className="text-2xl font-bold uppercase tracking-widest text-[var(--text-muted)] italic">
                              {iWon ? 'The gods feast in your name. +20 Glory.' : iLost ? `${p2.name} claimed your head. -10 Glory.` : 'Neither blade found flesh. +5 Glory.'}
                           </p>
                        </div>
                        <button onClick={() => { setPhase('MODE'); setWinner(null); router.push('/tools/tic-tac-toe'); }} className="btn-primary px-24 py-8 rounded-full text-sm font-black uppercase italic shadow-[0_20px_50px_rgba(255,60,172,0.4)] hover:scale-105 transition-all">Return to Command Center</button>
                     </div>
                  )}
               </div>
               
               <UnityAvatar avatarId={p2Avatar} action={rightAction} name={p2.name} points={p2.points} isFlipped={true} isActive={!isPlayerTurn} isWinner={winner === "O"} />
            </div>
         )}
         
         {/* PHASE: WAITING */}
         {phase === 'WAITING' && (
            <div className="flex flex-col items-center gap-12 z-30 animate-in zoom-in">
               <div className="w-72 h-72 rounded-full border-8 border-[var(--brand-primary)] animate-spin border-t-transparent shadow-[0_0_100px_rgba(255,60,172,0.3)] flex items-center justify-center"><Swords size={100} className="text-[var(--text-main)] -rotate-45" /></div>
               <div className="text-center space-y-4">
                  <h2 className="text-7xl font-black uppercase italic text-[var(--text-main)] tracking-tighter">{userId === duelData?.player1Id ? `Summoning Viking...` : `Summoned to Combat!`}</h2>
                  <p className="text-sm font-bold uppercase tracking-[0.4em] text-[var(--text-muted)] italic">Wait for the blades to meet</p>
               </div>
               <div className="flex gap-8">
                  {userId === duelData?.player2Id ? (
                    <>
                      <button onClick={() => handleAcceptReject('ACCEPT')} className="px-20 py-8 rounded-full bg-yellow-500 text-black font-black uppercase italic border-4 border-yellow-400/20 hover:scale-105 transition-all shadow-2xl">Enter Arena</button>
                      <button onClick={() => handleAcceptReject('REJECT')} className="px-20 py-8 rounded-full bg-red-600/10 text-red-500 font-black uppercase italic border-4 border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-xl">Refuse Summons</button>
                    </>
                  ) : (
                    <button onClick={() => { router.push('/tools/tic-tac-toe'); setPhase('MODE'); }} className="px-20 py-8 rounded-full bg-white/5 text-[var(--text-main)] font-black uppercase italic border-2 border-white/10 hover:bg-white/10 transition-all">Withdraw Challenge</button>
                  )}
               </div>
            </div>
         )}
      </div>

      <style jsx global>{`
         @keyframes viking-breathing { 
            0%, 100% { transform: scale(1) translateY(0) rotate(0deg); } 
            50% { transform: scale(1.04) translateY(-15px) rotate(1.5deg); } 
         }
         @keyframes viking-strike { 
            0% { transform: rotate(0deg) scale(1) translateX(0); } 
            20% { transform: rotate(-20deg) scale(1.1) translateX(-30px); } 
            40% { transform: rotate(25deg) scale(1.6) translateX(50px); filter: brightness(1.7); } 
            100% { transform: rotate(0deg) scale(1) translateX(0); } 
         }
         .animate-viking-breathing { animation: viking-breathing 4s infinite ease-in-out; }
         .animate-viking-strike { animation: viking-strike 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
         .perspective-1000 { perspective: 1000px; }
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--brand-primary); border-radius: 10px; }
      `}</style>
    </main>
  );
}

function RoastPopup({ text, onComplete }: { text: string, onComplete: () => void }) {
   const [pos] = useState({ top: Math.random() * 60 + 20, left: Math.random() * 60 + 20 });
   useEffect(() => { const timer = setTimeout(onComplete, 4000); return () => clearTimeout(timer); }, []);
   return (
      <div className="fixed z-[100] animate-in zoom-in fade-in slide-in-from-bottom-8 duration-500 pointer-events-none" style={{ top: `${pos.top}%`, left: `${pos.left}%` }}>
         <div className="relative">
            <div className="absolute -inset-2 bg-yellow-500/20 blur-xl rounded-full" />
            <div className="relative bg-black/90 border-2 border-yellow-600 p-8 rounded-[40px] rounded-bl-none shadow-2xl max-w-xs backdrop-blur-xl">
               <p className="text-md font-black italic text-yellow-500 leading-tight">"{text}"</p>
            </div>
            <div className="w-8 h-8 bg-black border-l-2 border-b-2 border-yellow-600 rotate-45 -mt-4 ml-0 bg-black/90" />
         </div>
      </div>
   );
}
