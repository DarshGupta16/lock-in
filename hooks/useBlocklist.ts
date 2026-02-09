"use client";

import { useState, useCallback } from "react";

const DEFAULT_BLOCKLIST = [
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "instagram.com",
];

export function useBlocklist() {
  const [blocklist, setBlocklist] = useState<string[]>(DEFAULT_BLOCKLIST);

  const addDomain = useCallback((domain: string) => {
    const cleanDomain = domain.trim().toLowerCase();
    if (cleanDomain && !blocklist.includes(cleanDomain)) {
      setBlocklist((prev) => [...prev, cleanDomain]);
    }
  }, [blocklist]);

  const removeDomain = useCallback((domain: string) => {
    setBlocklist((prev) => prev.filter((d) => d !== domain));
  }, []);

  return {
    blocklist,
    addDomain,
    removeDomain,
  };
}
