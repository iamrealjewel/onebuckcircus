"use client";
import React, { createContext, useContext, useState } from "react";
import { generateFunnyAlert } from "@/app/actions/acts";

type DialogType = "alert" | "confirm";

interface DialogOptions {
  context: string;
  type?: DialogType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  showAlert: (context: string) => void;
  showConfirm: (context: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useCircusDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Missing CircusAlertProvider");
  return ctx;
}

export function CircusAlertProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openDialog = async (options: DialogOptions) => {
    setDialog(options);
    setMessage(null);
    setLoading(true);
    try {
      const aiMessage = await generateFunnyAlert(options.context);
      setMessage(aiMessage);
    } catch (err) {
      setMessage(options.context); // fallback to raw context if AI fails
    }
    setLoading(false);
  };

  const showAlert = (context: string) => {
    openDialog({ context, type: "alert" });
  };

  const showConfirm = (context: string, onConfirm: () => void, onCancel?: () => void) => {
    openDialog({ context, type: "confirm", onConfirm, onCancel });
  };

  const close = (isConfirmAction: boolean = false) => {
    if (!isConfirmAction && dialog?.onCancel) {
      dialog.onCancel();
    }
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && close(false)} />
          <div className="relative bg-[#111] border-2 border-purple-500/50 rounded-3xl p-10 max-w-md w-full shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in zoom-in-95 fade-in duration-300 text-center flex flex-col items-center">
            
            <div className={`text-6xl mb-6 ${loading ? 'animate-spin' : 'animate-bounce'}`}>
              {loading ? '🔮' : '🎪'}
            </div>
            
            <h2 className="text-2xl font-black mb-4 text-white">
              {loading ? 'The Oracle Ponders...' : 'A Message from the Oracle'}
            </h2>
            
            <p className="text-gray-300 font-bold leading-relaxed mb-10 text-lg min-h-[60px] flex items-center justify-center">
              {loading ? <span className="opacity-50">Consulting the ancient circus scrolls...</span> : message}
            </p>
            
            <div className="flex gap-4 w-full">
              {dialog.type === "confirm" && (
                <button 
                  onClick={() => close(false)} 
                  disabled={loading}
                  className="flex-1 py-4 bg-transparent border-2 border-gray-600 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-30 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
                >
                  Nevermind
                </button>
              )}
              <button 
                onClick={() => {
                  if (dialog.type === "confirm" && dialog.onConfirm) {
                    dialog.onConfirm();
                  }
                  close(true);
                }} 
                disabled={loading}
                className="flex-1 py-4 bg-purple-500 rounded-xl font-black uppercase tracking-widest text-xs text-white disabled:opacity-50 hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-colors"
              >
                {dialog.type === "confirm" ? 'Proceed' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
