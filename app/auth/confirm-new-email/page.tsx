"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import RoastOverlay from "@/components/RoastOverlay";

function ConfirmEmailComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState("USER");
  const [roastText, setRoastText] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
      setLoading(false);
      return;
    }

    fetch("/api/auth/confirm-new-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setRole(data.role || "USER");
          setSuccess(true);
        } else {
          setError(await res.text() || "Failed to confirm email.");
        }
      })
      .catch(() => setError("An unexpected error occurred."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="text-center p-12">
        <Loader2 size={48} className="animate-spin text-green-500 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-[var(--text-muted)] animate-pulse">Forging your new identity...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-red-500">Identity Theft Failed</h2>
        <p className="text-[var(--text-muted)] font-medium">{error}</p>
        <button onClick={() => router.push("/")} className="btn-primary w-full mt-6 py-4 !bg-red-500 !border-red-500 hover:!bg-red-600 shadow-lg shadow-red-500/20">Return to Safety</button>
      </div>
    );
  }

  return (
    <div className="text-center p-8 space-y-4 animate-fade-in relative z-10">
      <RoastOverlay mode="confirm-new-email" onRoastFetched={setRoastText} />
      <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheck size={32} />
      </div>
      <h2 className="text-3xl font-black text-green-500 tracking-tighter">Identity Confirmed!</h2>
      <div className="min-h-[60px]">
        {roastText ? (
          <p className="text-[var(--brand-accent)] font-bold text-lg leading-relaxed animate-in zoom-in duration-500">{roastText}</p>
        ) : (
          <p className="text-[var(--text-muted)] font-medium text-lg leading-relaxed">
            The paperwork is filed, the scrolls are signed, and your new email is officially recognized by the Oracle.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 mt-8">
        {role === "ADMIN" ? (
          <button onClick={() => router.push("/ringmaster-override")} className="btn-primary w-full py-5 text-lg shadow-lg shadow-purple-500/20 !bg-purple-600 !border-purple-600 hover:!bg-purple-700">Log In (Ringmaster)</button>
        ) : (
          <button onClick={() => router.push("/auth")} className="btn-primary w-full py-5 text-lg shadow-lg shadow-[var(--brand-primary)]/20">Log In (Performer)</button>
        )}
      </div>
    </div>
  );
}

export default function ConfirmNewEmailPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-surface)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-green-500 font-bold animate-pulse z-10">Initializing secure link...</div>}>
        <div className="relative z-10 w-full max-w-md card-glass">
          <ConfirmEmailComponent />
        </div>
      </Suspense>
    </main>
  );
}
