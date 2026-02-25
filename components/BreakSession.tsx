"use client";

import { useState, useEffect, useRef } from "react";
import { Countdown } from "./Countdown";
import { Coffee, ChevronRight } from "lucide-react";
import { ReasonModal } from "./ReasonModal";

interface BreakSessionProps {
  nextSubject: string;
  endTime: string;
  durationSec: number;
  loading: boolean;
  onSkip: () => void;
  onStop: (reason: string) => void;
}

export function BreakSession({
  nextSubject,
  endTime,
  durationSec,
  loading,
  onSkip,
  onStop,
}: BreakSessionProps) {
  const [isOvertime, setIsOvertime] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    const target = new Date(endTime).getTime();
    const checkOvertime = () => {
      const now = Date.now();
      if (now >= target) {
        setIsOvertime(true);
        // Play sound only once when transitioning to overtime
        if (!hasPlayedRef.current) {
          const audio = new Audio('/alarm.mp3');
          audio.play().catch(e => console.error("Failed to play alarm:", e));
          hasPlayedRef.current = true;
        }
      }
    };

    checkOvertime();
    const interval = setInterval(checkOvertime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const handleConfirmStop = (reason: string) => {
    onStop(reason);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in zoom-in-95 duration-500">
      {/* Break Header */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-indigo-500/10 p-4 rounded-full">
          <Coffee className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-500 font-bold">
            On Break
          </p>
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <span className="text-[10px] uppercase tracking-[0.1em]">Next Up:</span>
            <span className="text-sm font-bold text-white tracking-tight">{nextSubject}</span>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="relative">
        <Countdown
          endTime={endTime}
          durationSec={durationSec}
          color="indigo"
        />
      </div>

      {/* Actions */}
      <div className="pt-8 flex flex-col items-center gap-6">
        {!isOvertime ? (
          <>
            <button
              onClick={onSkip}
              disabled={loading}
              className="group w-full py-6 bg-zinc-900 border border-zinc-800 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Skip Break & Focus
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
              className="text-[10px] uppercase tracking-[0.2em] transition-colors underline underline-offset-8 disabled:opacity-50 text-zinc-600 hover:text-white"
            >
              End Break Entirely (Not Recommended)
            </button>
          </>
        ) : (
          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-bold animate-pulse">
            Transitioning to session...
          </p>
        )}
        
        {!isOvertime && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            Session starts automatically when break ends
          </p>
        )}
      </div>

      <ReasonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmStop}
        loading={loading}
      />
    </div>
  );
}
