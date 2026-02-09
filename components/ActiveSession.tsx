"use client";

import { useState, useEffect } from "react";
import { Countdown } from "./Countdown";
import { Shield } from "lucide-react";

interface ActiveSessionProps {
  subject: string;
  endTime: string;
  durationSec: number;
  blocklist: string[];
  loading: boolean;
  onStop: () => void;
}

export function ActiveSession({
  subject,
  endTime,
  durationSec,
  blocklist,
  loading,
  onStop,
}: ActiveSessionProps) {
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    const target = new Date(endTime).getTime();
    const checkOvertime = () => {
      setIsOvertime(Date.now() >= target);
    };

    checkOvertime();
    const interval = setInterval(checkOvertime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="space-y-12 animate-in zoom-in-95 duration-500">
      {/* Current Task */}
      <div className="space-y-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
          Currently Working On
        </p>
        <h2 className="text-3xl font-bold tracking-tight">{subject}</h2>
      </div>

      {/* Countdown Timer */}
      <Countdown
        endTime={endTime}
        durationSec={durationSec}
      />

      {/* Blocklist Status */}
      {blocklist.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <Shield className="w-3 h-3" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
              Active Restrictions
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 opacity-50">
            {blocklist.map((domain) => (
              <span
                key={domain}
                className="bg-zinc-900 border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* End Early Button */}
      <div className="pt-8 flex justify-center">
        <button
          onClick={onStop}
          disabled={loading}
          className={`text-[10px] uppercase tracking-[0.2em] transition-colors underline underline-offset-8 disabled:opacity-50 ${
            isOvertime 
              ? "text-white hover:text-zinc-400" 
              : "text-zinc-600 hover:text-white"
          }`}
        >
          {loading 
            ? "Ending..." 
            : isOvertime 
              ? "Finish Session & Stop Enforcement" 
              : "End Early (Not Recommended)"}
        </button>
      </div>
    </div>
  );
}
