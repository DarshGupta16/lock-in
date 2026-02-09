"use client";

import { useState, useEffect } from "react";
import { Countdown } from "./Countdown";

interface ActiveSessionProps {
  subject: string;
  endTime: string;
  durationSec: number;
  loading: boolean;
  onStop: () => void;
}

export function ActiveSession({
  subject,
  endTime,
  durationSec,
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
