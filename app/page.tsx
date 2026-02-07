"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Timer as TimerIcon,
  Zap,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { startSession, stopSession } from "@/lib/hia";
import { SessionState } from "@/lib/types";

export default function LockInPage() {
  const [session, setSession] = useState<SessionState>({ isActive: false });
  const [subject, setSubject] = useState("");

  // Duration state (HH:MM:SS)
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("50");
  const [seconds, setSeconds] = useState("00");
  const [activePreset, setActivePreset] = useState<string | null>("50m");

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

    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    const s = parseInt(seconds || "0", 10);
    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds <= 0) {
      setError("Duration must be greater than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await startSession(subject, totalSeconds);

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);

      setSession({
        isActive: true,
        subject,
        startTime: startTime.toISOString(),
        durationSec: totalSeconds,
        endTime: endTime.toISOString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to initiate session");
    } finally {
      setLoading(false);
    }
  };

  const handleEndEarly = async () => {
    setLoading(true);
    try {
      await stopSession();
      setSession({ isActive: false });
      setSubject("");
    } catch (err: any) {
      setError(err.message || "Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSession({ isActive: false });
    setSubject("");
  };

  const handleDurationChange = (field: "h" | "m" | "s", value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    if (value.length > 2) return; // Max 2 chars

    if (field === "h") setHours(value);
    if (field === "m") setMinutes(value);
    if (field === "s") setSeconds(value);

    setActivePreset(null); // Clear preset if user types manually
  };

  const handleBlur = (field: "h" | "m" | "s", value: string) => {
    const padded = value.padStart(2, "0");
    if (field === "h") setHours(padded);
    if (field === "m") setMinutes(padded);
    if (field === "s") setSeconds(padded);
  };

  const setPreset = (h: number, m: number, label: string) => {
    setHours(h.toString().padStart(2, "0"));
    setMinutes(m.toString().padStart(2, "0"));
    setSeconds("00");
    setActivePreset(label);
  };

  const handleSessionComplete = async () => {
    // We don't necessarily need a loading state for auto-complete
    // but we should notify the backend
    try {
      await stopSession("completed");
    } catch (err) {
      console.error("Failed to notify backend of completion:", err);
    }
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
            <h1 className="text-xl font-bold tracking-tighter uppercase">
              Lock In
            </h1>
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
                Duration (HH:MM:SS)
              </label>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "25m", h: 0, m: 25 },
                  { label: "50m", h: 0, m: 50 },
                  { label: "1h 30m", h: 1, m: 30 },
                  { label: "2h", h: 2, m: 0 },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setPreset(p.h, p.m, p.label)}
                    className={`py-2 text-xs border transition-all ${
                      activePreset === p.label
                        ? "bg-white text-black border-white"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Timer Input */}
              <div className="flex items-center justify-center gap-2 text-4xl sm:text-7xl font-bold tracking-tighter">
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => handleDurationChange("h", e.target.value)}
                  onBlur={(e) => handleBlur("h", e.target.value)}
                  className="w-24 bg-transparent text-center border-b-2 border-zinc-800 focus:border-white transition-colors placeholder:text-zinc-800"
                  placeholder="00"
                />
                <span className="text-zinc-600 pb-2">:</span>
                <input
                  type="text"
                  value={minutes}
                  onChange={(e) => handleDurationChange("m", e.target.value)}
                  onBlur={(e) => handleBlur("m", e.target.value)}
                  className="w-24 bg-transparent text-center border-b-2 border-zinc-800 focus:border-white transition-colors placeholder:text-zinc-800"
                  placeholder="00"
                />
                <span className="text-zinc-600 pb-2">:</span>
                <input
                  type="text"
                  value={seconds}
                  onChange={(e) => handleDurationChange("s", e.target.value)}
                  onBlur={(e) => handleBlur("s", e.target.value)}
                  className="w-24 bg-transparent text-center border-b-2 border-zinc-800 focus:border-white transition-colors placeholder:text-zinc-800"
                  placeholder="00"
                />
              </div>
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
              className="group w-full py-6 bg-white text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
                Currently Working On
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                {session.subject}
              </h2>
            </div>

            <Countdown
              endTime={session.endTime!}
              onComplete={handleSessionComplete}
            />

            <div className="pt-8 flex justify-center">
              <button
                onClick={handleEndEarly}
                disabled={loading}
                className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors underline underline-offset-8 disabled:opacity-50"
              >
                {loading ? "Ending..." : "End Early (Not Recommended)"}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-12 flex flex-col items-center gap-4 text-center opacity-30 group hover:opacity-100 transition-opacity">
          <div className="flex gap-6">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="text-[8px] uppercase tracking-tighter">
                Homelab Armed
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TimerIcon className="w-3 h-3" />
              <span className="text-[8px] uppercase tracking-tighter">
                HIA Tracked
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Countdown({
  endTime,
  onComplete,
}: {
  endTime: string;
  onComplete: () => void;
}) {
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
      <div className="text-6xl sm:text-8xl font-black tracking-tighter tabular-nums">
        {hours > 0 ? `${hours}:` : ""}
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min(100, (timeLeft / (3600 * 1000)) * 100)}%`,
          }} // Just a placeholder logic for progress bar
        />
      </div>
    </div>
  );
}
