import { Countdown } from "./Countdown";

interface ActiveSessionProps {
  subject: string;
  endTime: string;
  durationSec: number;
  loading: boolean;
  onComplete: () => void;
  onEndEarly: () => void;
}

export function ActiveSession({
  subject,
  endTime,
  durationSec,
  loading,
  onComplete,
  onEndEarly,
}: ActiveSessionProps) {
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
        onComplete={onComplete}
      />

      {/* End Early Button */}
      <div className="pt-8 flex justify-center">
        <button
          onClick={onEndEarly}
          disabled={loading}
          className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors underline underline-offset-8 disabled:opacity-50"
        >
          {loading ? "Ending..." : "End Early (Not Recommended)"}
        </button>
      </div>
    </div>
  );
}
