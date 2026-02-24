"use client";

import { useState, useEffect } from "react";
import { Countdown } from "./Countdown";
import { Coffee, ChevronRight } from "lucide-react";
import { ReasonModal } from "./ReasonModal";

interface BreakSessionProps {
  nextSubject: string;
  endTime: string;
  durationSec: number;
  loading: boolean;
  onSkip: (reason?: string) => void;
}

export function BreakSession({
  nextSubject,
  endTime,
  durationSec,
  loading,
  onSkip,
}: BreakSessionProps) {
  const [isOvertime, setIsOvertime] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const target = new Date(endTime).getTime();
    const checkOvertime = () => {
      setIsOvertime(Date.now() >= target);
    };

    checkOvertime();
    const interval = setInterval(checkOvertime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const handleSkipClick = () => {
    if (isOvertime) {
      onSkip("Break finished");
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmSkip = (reason: string) => {
    onSkip(reason);
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

      {/* Skip Button */}
      <div className="pt-8 flex flex-col items-center gap-6">
        <button
          onClick={handleSkipClick}
          disabled={loading}
          className="group w-full py-6 bg-zinc-900 border border-zinc-800 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isOvertime ? "Start Session" : "Skip Break & Focus"}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        
        {!isOvertime && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            Session starts automatically when break ends
          </p>
        )}
      </div>

      <ReasonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSkip}
        loading={loading}
      />
    </div>
  );
}
