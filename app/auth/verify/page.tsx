"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import RoastOverlay from "@/components/RoastOverlay";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your clown scroll...");
  const [roastText, setRoastText] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

        if (res.ok) {
          setStatus("success");
          setMessage("You are officially a joker in the One Buck Circus!");
          setTimeout(() => router.push("/auth"), 3000);
        } else {
          setStatus("error");
          const errorText = await res.text();
          setMessage(errorText || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong during verification.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <main className="min-h-screen pt-24 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <RoastOverlay mode="verify" onRoastFetched={setRoastText} />
      <Navbar />
      <div className="w-full max-w-md card-glass p-12 text-center animate-fade-in relative z-10">
        <div className="flex justify-center mb-8">
          {status === "loading" && <Loader2 className="animate-spin text-[var(--brand-primary)]" size={64} />}
          {status === "success" && <CheckCircle2 className="text-green-500 animate-scale-in" size={64} />}
          {status === "error" && <AlertCircle className="text-red-500 animate-bounce" size={64} />}
        </div>
        
        <h1 className="text-3xl font-black mb-4 tracking-tighter">
          {status === "loading" ? "Hold on tight!" : status === "success" ? "Verified!" : "Bungled!"}
        </h1>
        <div className="min-h-[40px]">
          {roastText && status !== "error" ? (
            <p className="text-[var(--brand-accent)] font-bold animate-in zoom-in duration-500">{roastText}</p>
          ) : (
            <p className="text-[var(--text-muted)] font-medium leading-relaxed">
              {message}
            </p>
          )}
        </div>
        
        {status === "success" && (
          <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">
            Redirecting to the login tent...
          </p>
        )}
      </div>
    </main>
  );
}
