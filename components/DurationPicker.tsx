import type { DurationPreset } from "@/hooks";

interface DurationPickerProps {
  hours: string;
  minutes: string;
  seconds: string;
  activePreset: string | null;
  presets: DurationPreset[];
  onPresetSelect: (h: number, m: number, label: string) => void;
  onChange: (field: "h" | "m" | "s", value: string) => void;
  onBlur: (field: "h" | "m" | "s", value: string) => void;
}

export function DurationPicker({
  hours,
  minutes,
  seconds,
  activePreset,
  presets,
  onPresetSelect,
  onChange,
  onBlur,
}: DurationPickerProps) {
  return (
    <div className="space-y-4">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
        Duration (HH:MM:SS)
      </label>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onPresetSelect(p.h, p.m, p.label)}
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
          onChange={(e) => onChange("h", e.target.value)}
          onBlur={(e) => onBlur("h", e.target.value)}
          className="w-24 bg-transparent text-center border-b-2 border-zinc-800 focus:border-white transition-colors placeholder:text-zinc-800"
          placeholder="00"
        />
        <span className="text-zinc-600 pb-2">:</span>
        <input
          type="text"
          value={minutes}
          onChange={(e) => onChange("m", e.target.value)}
          onBlur={(e) => onBlur("m", e.target.value)}
          className="w-24 bg-transparent text-center border-b-2 border-zinc-800 focus:border-white transition-colors placeholder:text-zinc-800"
          placeholder="00"
        />
        <span className="text-zinc-600 pb-2">:</span>
        <input
          type="text"
          value={seconds}
          onChange={(e) => onChange("s", e.target.value)}
          onBlur={(e) => onBlur("s", e.target.value)}
          className="w-24 bg-transparent text-center border-b-2 border-zinc-800 focus:border-white transition-colors placeholder:text-zinc-800"
          placeholder="00"
        />
      </div>
    </div>
  );
}
