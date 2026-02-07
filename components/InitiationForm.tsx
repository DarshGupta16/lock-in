import { ChevronRight, AlertCircle } from "lucide-react";
import { DurationPicker } from "./DurationPicker";
import type { DurationPreset } from "@/hooks";

interface InitiationFormProps {
  // Subject
  subject: string;
  onSubjectChange: (value: string) => void;
  // Duration
  hours: string;
  minutes: string;
  seconds: string;
  activePreset: string | null;
  presets: DurationPreset[];
  onPresetSelect: (h: number, m: number, label: string) => void;
  onDurationChange: (field: "h" | "m" | "s", value: string) => void;
  onDurationBlur: (field: "h" | "m" | "s", value: string) => void;
  // Actions
  onStart: () => void;
  loading: boolean;
  error: string | null;
}

export function InitiationForm({
  subject,
  onSubjectChange,
  hours,
  minutes,
  seconds,
  activePreset,
  presets,
  onPresetSelect,
  onDurationChange,
  onDurationBlur,
  onStart,
  loading,
  error,
}: InitiationFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onStart();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Intent Input */}
      <div className="space-y-4">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
          Intent
        </label>
        <input
          autoFocus
          type="text"
          placeholder="What are we crushing?"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-b border-zinc-800 py-4 text-2xl focus:border-white transition-colors placeholder:text-zinc-800"
        />
      </div>

      {/* Duration Picker */}
      <DurationPicker
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        activePreset={activePreset}
        presets={presets}
        onPresetSelect={onPresetSelect}
        onChange={onDurationChange}
        onBlur={onDurationBlur}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 border border-red-500/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
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
  );
}
