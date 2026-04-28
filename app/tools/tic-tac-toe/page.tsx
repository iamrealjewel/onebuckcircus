"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { X, Circle, RotateCcw, MessageSquare, Loader2 } from "lucide-react";
import { aiGetTicTacToeMove } from "@/app/actions/acts";

export default function TicTacToePage() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [trashTalk, setTrashTalk] = useState("Make your move, mortal. I'm bored.");
  const [loading, setLoading] = useState(false);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diags
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return "draw";
    return null;
  };

  const handleSquareClick = async (index: number) => {
    if (board[index] || winner || !isPlayerTurn || loading) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const winStatus = checkWinner(newBoard);
    if (winStatus) {
      setWinner(winStatus);
      setTrashTalk(winStatus === "X" ? "You got lucky. My circuits were dusty." : "A draw? Pathetic.");
      return;
    }

    setIsPlayerTurn(false);
    setLoading(true);
    
    try {
      const aiResponse = await aiGetTicTacToeMove(newBoard);
      const aiBoard = [...newBoard];
      
      // AI move
      const move = aiResponse.moveIndex;
      if (move >= 0 && move <= 8 && aiBoard[move] === null) {
        aiBoard[move] = "O";
      } else {
        // AI tried to cheat or picked a full slot, find first empty
        const firstEmpty = aiBoard.findIndex(s => s === null);
        if (firstEmpty !== -1) aiBoard[firstEmpty] = "O";
      }

      setBoard(aiBoard);
      setTrashTalk(aiResponse.trashTalk);
      
      const finalWinStatus = checkWinner(aiBoard);
      if (finalWinStatus) {
        setWinner(finalWinStatus);
      } else {
        setIsPlayerTurn(true);
      }
    } catch (err) {
      console.error(err);
      setTrashTalk("The Oracle had a brain fart. Try again.");
      setIsPlayerTurn(true);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
    setTrashTalk("Reset? Typical. Trying to erase your failures?");
  };

  return (
    <main className="min-h-screen bg-[var(--bg-surface)] pt-24 pb-12 px-6 lg:px-12 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full mx-auto animate-fade-in space-y-8 flex flex-col items-center">
        <div className="text-center space-y-2">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">The Oracle's Gambit</h1>
          <p className="text-[var(--text-muted)] text-xl font-medium max-w-2xl mx-auto">
            A chaotic game of Tic-Tac-Toe. The Oracle doesn't just play; it judges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
          
          {/* AI Trash Talk Area */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="card-glass p-8 border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 relative overflow-hidden min-h-[200px] flex flex-col justify-center">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <MessageSquare className="text-[var(--brand-primary)]" size={32} />
                </div>
                <div className="space-y-2">
                  <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">The Oracle Judges:</div>
                  <p className="text-2xl md:text-3xl font-black italic leading-tight text-[var(--text-main)]">"{trashTalk}"</p>
                </div>
              </div>
              {loading && (
                <div className="absolute inset-0 bg-[var(--bg-card)]/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
                  <Loader2 className="animate-spin text-[var(--brand-primary)]" size={48} />
                  <span className="font-black text-sm uppercase tracking-[0.3em] text-[var(--brand-primary)]">Calculating your doom...</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
               {winner && (
                <div className="p-6 rounded-2xl bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/30 text-center animate-in zoom-in-95">
                  <h2 className="text-3xl font-black mb-4 uppercase tracking-widest text-[var(--brand-accent)]">
                    {winner === "X" ? "You Won?!" : winner === "O" ? "Oracle Wins." : "It's a Draw."}
                  </h2>
                  <button onClick={resetGame} className="btn-primary py-5 px-12 text-xl shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.3)]">
                    <RotateCcw className="mr-2" size={24} /> Play Again
                  </button>
                </div>
              )}
              {!winner && (
                <button onClick={resetGame} className="btn-outline py-4 w-full text-sm uppercase tracking-widest gap-2">
                  <RotateCcw size={16} /> Forfeit & Restart
                </button>
              )}
            </div>
          </div>

          {/* Board */}
          <div className="order-1 lg:order-2 grid grid-cols-3 gap-4 aspect-square w-full max-w-lg mx-auto">
            {board.map((square, i) => (
              <button
                key={i}
                onClick={() => handleSquareClick(i)}
                disabled={!!square || !!winner || !isPlayerTurn || loading}
                className={`card-glass aspect-square flex items-center justify-center text-5xl transition-all duration-300 relative overflow-hidden ${!square && !winner && isPlayerTurn && !loading ? 'hover:bg-[var(--brand-primary)]/10 hover:scale-[1.02] cursor-crosshair' : 'cursor-default'}`}
              >
                {square === "X" && (
                  <div className="animate-in zoom-in duration-300">
                    <X className="text-[var(--brand-primary)] drop-shadow-[0_0_15px_rgba(255,60,172,0.5)]" size={80} strokeWidth={4} />
                  </div>
                )}
                {square === "O" && (
                  <div className="animate-in zoom-in duration-300">
                    <Circle className="text-[var(--brand-accent)] drop-shadow-[0_0_15px_rgba(255,214,10,0.5)]" size={70} strokeWidth={4} />
                  </div>
                )}
                {!square && !winner && isPlayerTurn && !loading && (
                   <div className="absolute inset-0 opacity-0 hover:opacity-20 flex items-center justify-center transition-opacity">
                      <X className="text-[var(--brand-primary)]" size={40} strokeWidth={2} />
                   </div>
                )}
              </button>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
