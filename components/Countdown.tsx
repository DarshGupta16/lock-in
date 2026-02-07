"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownProps {
  endTime: string;
  durationSec: number;
  onComplete: () => void;
}

export function Countdown({
  endTime,
  durationSec,
  onComplete,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // Reset completion flag when endTime changes (new session)
    hasCompletedRef.current = false;
  }, [endTime]);

  useEffect(() => {
    const target = new Date(endTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft(diff);

      // Only call onComplete once per session
      if (diff === 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const progress =
    durationSec > 0 ? (timeLeft / (durationSec * 1000)) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-6xl sm:text-8xl font-black tracking-tighter tabular-nums">
        {hours > 0 ? `${hours}:` : ""}
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min(100, progress)}%`,
          }}
        />
      </div>
    </div>
  );
}
