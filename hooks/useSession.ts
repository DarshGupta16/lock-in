"use client";

import { useState, useEffect, useCallback } from "react";
import { startSession, stopSession, getSessionStatus } from "@/lib/hia";
import { SessionState } from "@/lib/types";

const STORAGE_KEY = "lock-in-session";

// Helper to safely restore session from localStorage (SSR-safe)
function getInitialSession(): SessionState {
  if (typeof window === "undefined") return { isActive: false };

  const savedSession = localStorage.getItem(STORAGE_KEY);
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession) as SessionState;
      if (parsed.isActive) {
        return parsed;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return { isActive: false };
}

export function useSession() {
  // Lazy initialization from localStorage (runs once, no cascading render)
  const [session, setSession] = useState<SessionState>(getInitialSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Persist session to localStorage
  useEffect(() => {
    if (session.isActive) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  // Sync with global status from server
  useEffect(() => {
    if (!mounted) return;

    const syncStatus = async () => {
      // Don't poll if the tab is hidden to save energy/bandwidth
      if (document.hidden) return;

      try {
        const data = await getSessionStatus();
        const active = data.activeSession;

        if (active) {
          const startTime = new Date(active.created);
          const totalSeconds = active.planned_duration_sec;
          const endTime = new Date(startTime.getTime() + totalSeconds * 1000).toISOString();

          setSession((prev) => {
            // Only update if something actually changed
            if (
              prev.isActive &&
              prev.subject === active.subject &&
              prev.endTime === endTime
            ) {
              return prev;
            }
            return {
              isActive: true,
              subject: active.subject,
              startTime: startTime.toISOString(),
              durationSec: totalSeconds,
              endTime,
              blocklist: data.blocklist || [],
            };
          });
        } else {
          setSession((prev) => (prev.isActive ? { isActive: false } : prev));
        }
      } catch (err) {
        console.error("Failed to sync session status:", err);
      }
    };

    syncStatus();
    const interval = setInterval(syncStatus, 10000);
    
    // Add visibility change listener to sync immediately when returning to tab
    document.addEventListener("visibilitychange", syncStatus);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", syncStatus);
    };
  }, [mounted]);

  const handleStart = useCallback(
    async (subject: string, totalSeconds: number, blocklist: string[]) => {
      if (!subject.trim()) {
        setError("Subject is required");
        return false;
      }

      if (totalSeconds <= 0) {
        setError("Duration must be greater than 0");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await startSession(subject, totalSeconds, blocklist);

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + totalSeconds * 1000);

        setSession({
          isActive: true,
          subject,
          startTime: startTime.toISOString(),
          durationSec: totalSeconds,
          endTime: endTime.toISOString(),
          blocklist,
        });
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to initiate session";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleStop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass the blocklist stored in the current session state
      await stopSession(session.blocklist || []);
      setSession({ isActive: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to end session";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session.blocklist]);

  const clearError = useCallback(() => setError(null), []);

  return {
    session,
    loading,
    error,
    mounted,
    handleStart,
    handleStop,
    clearError,
  };
}
