"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownProps {
  endTime: string;
  durationSec: number;
  color?: "white" | "indigo" | "red";
}

export function Countdown({
  endTime,
  durationSec,
  color = "white",
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

  const colorClasses = {
    white: "bg-white text-white",
    indigo: "bg-indigo-500 text-indigo-500",
    red: "bg-red-500 text-red-500",
  };

  const currentColor = isOvertime ? "red" : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-6xl sm:text-8xl font-black tracking-tighter tabular-nums ${colorClasses[currentColor].split(' ')[1]}`}>
        {isOvertime ? "+" : ""}
        {hours > 0 ? `${hours}:` : ""}
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${colorClasses[currentColor].split(' ')[0]}`}
          style={{
            width: `${Math.max(0, Math.min(100, progress))}%`,
          }}
        />
      </div>
    </div>
  );
}
