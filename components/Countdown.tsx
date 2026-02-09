"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownProps {
  endTime: string;
  durationSec: number;
}

export function Countdown({
  endTime,
  durationSec,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(endTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      setTimeLeft(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const isOvertime = timeLeft <= 0;
  const absTimeLeft = Math.abs(timeLeft);

  const hours = Math.floor(absTimeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((absTimeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absTimeLeft % (1000 * 60)) / 1000);

  const progress =
    durationSec > 0 ? (timeLeft / (durationSec * 1000)) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-6xl sm:text-8xl font-black tracking-tighter tabular-nums ${isOvertime ? 'text-white' : ''}`}>
        {isOvertime ? "+" : ""}
        {hours > 0 ? `${hours}:` : ""}
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.max(0, Math.min(100, progress))}%`,
          }}
        />
      </div>
    </div>
  );
}
