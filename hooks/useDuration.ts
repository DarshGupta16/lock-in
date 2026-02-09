"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEYS = {
  hours: "lock-in-hours",
  minutes: "lock-in-minutes",
  seconds: "lock-in-seconds",
  preset: "lock-in-active-preset",
};

const DEFAULT_VALUES = {
  hours: "00",
  minutes: "50",
  seconds: "00",
  preset: "50m",
};

export interface DurationPreset {
  label: string;
  h: number;
  m: number;
}

export const DURATION_PRESETS: DurationPreset[] = [
  { label: "25m", h: 0, m: 25 },
  { label: "50m", h: 0, m: 50 },
  { label: "1h 30m", h: 1, m: 30 },
  { label: "2h", h: 2, m: 0 },
];

// Helper to safely get from localStorage (SSR-safe)
function getStorageValue(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}

export function useDuration() {
  // Lazy initialization from localStorage (runs once, no cascading render)
  const [hours, setHours] = useState(() =>
    getStorageValue(STORAGE_KEYS.hours, DEFAULT_VALUES.hours),
  );
  const [minutes, setMinutes] = useState(() =>
    getStorageValue(STORAGE_KEYS.minutes, DEFAULT_VALUES.minutes),
  );
  const [seconds, setSeconds] = useState(() =>
    getStorageValue(STORAGE_KEYS.seconds, DEFAULT_VALUES.seconds),
  );
  const [activePreset, setActivePreset] = useState<string | null>(() =>
    getStorageValue(STORAGE_KEYS.preset, DEFAULT_VALUES.preset),
  );

  // Persist duration changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hours, hours);
    localStorage.setItem(STORAGE_KEYS.minutes, minutes);
    localStorage.setItem(STORAGE_KEYS.seconds, seconds);
  }, [hours, minutes, seconds]);

  // Persist preset changes
  useEffect(() => {
    if (activePreset) {
      localStorage.setItem(STORAGE_KEYS.preset, activePreset);
    } else {
      localStorage.removeItem(STORAGE_KEYS.preset);
    }
  }, [activePreset]);

  const handleChange = useCallback((field: "h" | "m" | "s", value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    if (value.length > 2) return; // Max 2 chars

    if (field === "h") setHours(value);
    if (field === "m") setMinutes(value);
    if (field === "s") setSeconds(value);

    setActivePreset(null); // Clear preset if user types manually
  }, []);

  const handleBlur = useCallback((field: "h" | "m" | "s", value: string) => {
    const padded = value.padStart(2, "0");
    if (field === "h") setHours(padded);
    if (field === "m") setMinutes(padded);
    if (field === "s") setSeconds(padded);
  }, []);

  const setPreset = useCallback((h: number, m: number, label: string) => {
    setHours(h.toString().padStart(2, "0"));
    setMinutes(m.toString().padStart(2, "0"));
    setSeconds("00");
    setActivePreset(label);
  }, []);

  const getTotalSeconds = useCallback(() => {
    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    const s = parseInt(seconds || "0", 10);
    return h * 3600 + m * 60 + s;
  }, [hours, minutes, seconds]);

  return {
    hours,
    minutes,
    seconds,
    activePreset,
    handleChange,
    handleBlur,
    setPreset,
    getTotalSeconds,
    presets: DURATION_PRESETS,
  };
}
