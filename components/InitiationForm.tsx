import { ChevronRight, AlertCircle, X, Plus } from "lucide-react";
import { DurationPicker } from "./DurationPicker";
import { useState } from "react";
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
  // Blocklist
  blocklist: string[];
  onAddDomain: (domain: string) => void;
  onRemoveDomain: (domain: string) => void;
  // Actions
  onStart: () => void;
  onStartBreak: (breakSec: number) => void;
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
  blocklist,
  onAddDomain,
  onRemoveDomain,
  onStart,
  onStartBreak,
  loading,
  error,
}: InitiationFormProps) {
  const [newDomain, setNewDomain] = useState("");
  const [breakDuration, setBreakDuration] = useState(10); // Default 10 mins

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (newDomain.trim()) {
        onAddDomain(newDomain);
        setNewDomain("");
      } else {
        onStart();
      }
    }
  };

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      onAddDomain(newDomain);
      setNewDomain("");
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

      {/* Blocklist Section */}
      <div className="space-y-4">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
          Restrictions
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {blocklist.map((domain) => (
            <span
              key={domain}
              className="group flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            >
              {domain}
              <button
                onClick={() => onRemoveDomain(domain)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Add domain to block..."
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-b border-zinc-900 py-2 text-sm focus:border-zinc-500 transition-colors placeholder:text-zinc-800"
          />
          <button
            onClick={handleAddDomain}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-2"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 border border-red-500/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
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

        {/* Break Selector and Button */}
        <div className="flex gap-2">
          <div className="flex-1 flex bg-zinc-900 border border-zinc-800">
            {[5, 10, 15, 20].map((mins) => (
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
          </div>
          <button
            onClick={() => onStartBreak(breakDuration * 60)}
            disabled={loading || !subject.trim()}
            className="flex-[2] py-3 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Take a Break First
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
