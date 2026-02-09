import { Zap, Timer as TimerIcon } from "lucide-react";

export function Footer() {
  return (
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
  );
}
