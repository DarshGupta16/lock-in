"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "lock-in-blocklist";

const DEFAULT_BLOCKLIST = [
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "instagram.com",
];

function getInitialBlocklist(): string[] {
  if (typeof window === "undefined") return DEFAULT_BLOCKLIST;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_BLOCKLIST;
    }
  }
  return DEFAULT_BLOCKLIST;
}

export function useBlocklist() {
  const [blocklist, setBlocklist] = useState<string[]>(getInitialBlocklist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocklist));
  }, [blocklist]);

  const addDomain = useCallback((domain: string) => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    
    const domainsToAdd = domain
      .split(/\s+/)
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0 && domainRegex.test(d));

    if (domainsToAdd.length === 0) return;

    setBlocklist((prev) => {
      const currentSet = new Set(prev);
      let changed = false;
      
      domainsToAdd.forEach((d) => {
        if (!currentSet.has(d)) {
          currentSet.add(d);
          changed = true;
        }
      });
      
      return changed ? Array.from(currentSet) : prev;
    });
  }, []);

  const removeDomain = useCallback((domain: string) => {
    setBlocklist((prev) => prev.filter((d) => d !== domain));
  }, []);

  return {
    blocklist,
    addDomain,
    removeDomain,
  };
}