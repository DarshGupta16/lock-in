"use client";

import { useState, useEffect } from "react";
import { Lock, Timer as TimerIcon, Zap, ChevronRight, AlertCircle } from "lucide-react";
import { startSession } from "@/lib/hia";
import { SessionState } from "@/lib/types";

export default function LockInPage() {
  const [session, setSession] = useState<SessionState>({ isActive: false });
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lock-in-session");
    if (saved) {
      const parsed = JSON.parse(saved) as SessionState;
      if (parsed.isActive && parsed.endTime) {
        const remaining = new Date(parsed.endTime).getTime() - Date.now();
        if (remaining > 0) {
          setSession(parsed);
        } else {
          localStorage.removeItem("lock-in-session");
        }
      }
    }
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (session.isActive) {
      localStorage.setItem("lock-in-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("lock-in-session");
    }
  }, [session]);

  const handleStart = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const durationNum = parseInt(duration);
      await startSession(subject, durationNum);
      
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationNum * 60 * 1000);
      
      setSession({
        isActive: true,
        subject,
        startTime: startTime.toISOString(),
        durationSec: durationNum * 60,
        endTime: endTime.toISOString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to initiate session");
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSession({ isActive: false });
    setSubject("");
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white font-mono">
      <div className="w-full max-w-md space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tighter uppercase">Lock In</h1>
          </div>
          {session.isActive && (
            <div className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
              Locked
            </div>
          )}
        </div>

        {!session.isActive ? (
          /* Initiation Form */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                Intent
              </label>
              <input
                autoFocus
                type="text"
                placeholder="What are we crushing?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="w-full bg-transparent border-b border-zinc-800 py-4 text-2xl focus:border-white transition-colors placeholder:text-zinc-800"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                Duration (minutes)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["25", "50", "90", "120"].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`py-3 text-sm border transition-all ${
                      duration === min 
                        ? "bg-white text-black border-white" 
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                    }`}
                  >
                    {min}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm focus:border-white transition-colors placeholder:text-zinc-800 text-center"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={() => handleStart()}
              disabled={loading || !subject.trim()}
              className="group w-full py-6 bg-white text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Commence Session
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Active Timer */
          <div className="space-y-12 animate-in zoom-in-95 duration-500">
            <div className="space-y-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Currently Working On</p>
              <h2 className="text-3xl font-bold tracking-tight">{session.subject}</h2>
            </div>

            <Countdown endTime={session.endTime!} onComplete={resetSession} />

            <div className="pt-8 flex justify-center">
              <button 
                onClick={resetSession}
                className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors underline underline-offset-8"
              >
                End Early (Not Recommended)
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-12 flex flex-col items-center gap-4 text-center opacity-30 group hover:opacity-100 transition-opacity">
           <div className="flex gap-6">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span className="text-[8px] uppercase tracking-tighter">Homelab Armed</span>
              </div>
              <div className="flex items-center gap-1">
                <TimerIcon className="w-3 h-3" />
                <span className="text-[8px] uppercase tracking-tighter">HIA Tracked</span>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}

function Countdown({ endTime, onComplete }: { endTime: string, onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(endTime).getTime();
    
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft(diff);
      
      if (diff === 0) {
        onComplete();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-8xl font-black tracking-tighter tabular-nums">
        {hours > 0 && `${hours}:`}{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear" 
          style={{ width: `${Math.min(100, (timeLeft / (3600 * 1000)) * 100)}%` }} // Just a placeholder logic for progress bar
        />
      </div>
    </div>
  );
}