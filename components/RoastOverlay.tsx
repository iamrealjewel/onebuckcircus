"use client";

import { useState, useEffect } from "react";
import { generateAuthRoast } from "@/app/actions/acts";

export default function RoastOverlay({ mode, onRoastFetched }: { mode: string, onRoastFetched?: (roastText: string) => void }) {
  const [roast, setRoast] = useState<{ roast: string, popupRoasts?: Array<{emoji: string, text: string}> } | null>(null);
  const [activePopup, setActivePopup] = useState<{ emoji: string, text: string, x: number, y: number, rotation: number, scale: number } | null>(null);
  const [roastsEnabled, setRoastsEnabled] = useState(true);

  useEffect(() => {
    const checkRoastPref = () => {
      setRoastsEnabled(localStorage.getItem('roastsEnabled') !== 'false');
    };
    checkRoastPref();
    window.addEventListener('roastToggle', checkRoastPref);
    return () => window.removeEventListener('roastToggle', checkRoastPref);
  }, []);

  useEffect(() => {
    if (!roastsEnabled) {
      setRoast(null);
      return;
    }
    generateAuthRoast(mode).then((data) => {
      setRoast(data);
      if (onRoastFetched && data.roast) {
        onRoastFetched(data.roast);
      }
    }).catch(console.error);
  }, [mode, roastsEnabled, onRoastFetched]);

  useEffect(() => {
    if (!roastsEnabled || !roast?.popupRoasts?.length) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const randomRoast = roast.popupRoasts![Math.floor(Math.random() * roast.popupRoasts!.length)];
        const isLeftSide = Math.random() > 0.5;
        const x = isLeftSide ? Math.random() * 10 + 15 : Math.random() * 10 + 75;
        const y = Math.random() * 60 + 20;
        const rotation = Math.random() * 60 - 30;
        const scale = Math.random() * 0.5 + 0.8;
        
        setActivePopup({ ...randomRoast, x, y, rotation, scale });
        
        setTimeout(() => setActivePopup(null), 2000);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [roast, roastsEnabled]);

  if (!activePopup) return null;

  return (
    <div 
      className="fixed z-50 pointer-events-none animate-in zoom-in spin-in duration-300 flex flex-col items-center justify-center drop-shadow-2xl"
      style={{ 
        left: `${activePopup.x}%`, 
        top: `${activePopup.y}%`, 
        transform: `translate(-50%, -50%) rotate(${activePopup.rotation}deg) scale(${activePopup.scale})` 
      }}
    >
      <div className="text-8xl md:text-9xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce">{activePopup.emoji}</div>
      <div className="mt-4 bg-[var(--bg-card)] text-[var(--text-main)] px-6 py-3 rounded-2xl border-4 border-[var(--brand-primary)] font-black text-xl md:text-2xl whitespace-nowrap text-center uppercase tracking-widest rotate-3 shadow-[0_0_30px_var(--brand-primary)]">
        {activePopup.text}
      </div>
    </div>
  );
}
