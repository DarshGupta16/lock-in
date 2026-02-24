import { X, ChevronRight } from "lucide-react";
import { useState } from "react";

interface BreakSelectorProps {
  onStartBreak: (breakSec: number) => void;
  disabled?: boolean;
}

export function BreakSelector({ onStartBreak, disabled }: BreakSelectorProps) {
  const [breakDuration, setBreakDuration] = useState(10); // Default 10 mins
  const [isCustomBreak, setIsCustomBreak] = useState(false);
  const [customBreak, setCustomBreak] = useState("10");

  const handleStart = () => {
    const duration = isCustomBreak ? parseInt(customBreak) || 5 : breakDuration;
    onStartBreak(duration * 60);
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 flex bg-zinc-900 border border-zinc-800">
        {!isCustomBreak ? (
          <>
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => setBreakDuration(mins)}
                className={`flex-1 py-3 text-[10px] font-bold transition-colors ${
                  breakDuration === mins 
                    ? "text-white bg-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {mins}m
              </button>
            ))}
            <button
              onClick={() => setIsCustomBreak(true)}
              className="flex-1 py-3 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ...
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center px-2 gap-2">
            <input
              autoFocus
              type="text"
              value={customBreak}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCustomBreak(val);
              }}
              className="w-full bg-transparent text-[10px] font-bold text-white outline-none text-center"
              placeholder="MINS"
            />
            <button 
              onClick={() => setIsCustomBreak(false)}
              className="text-zinc-600 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      <button
        onClick={handleStart}
        disabled={disabled}
        className="flex-[2] py-3 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Take a Break First
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
