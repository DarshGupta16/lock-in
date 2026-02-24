"use client";

import { useState, useEffect, useCallback } from "react";
import { startSession, stopSession, getSessionStatus, startBreak, stopBreak } from "@/lib/hia";
import { SessionState } from "@/lib/types";

const STORAGE_KEY = "lock-in-session";

// Helper to safely restore session from localStorage (SSR-safe)
function getInitialSession(): SessionState {
  if (typeof window === "undefined") return { isActive: false, status: 'IDLE' };

  const savedSession = localStorage.getItem(STORAGE_KEY);
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession) as SessionState;
      if (parsed.isActive || parsed.status === 'BREAK') {
        return parsed;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return { isActive: false, status: 'IDLE' };
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
    if (session.isActive || session.status === 'BREAK') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  // Sync with global status from server
  useEffect(() => {
    if (!mounted) return;

    let errorCount = 0;

    const syncStatus = async () => {
      // Don't poll if the tab is hidden to save energy/bandwidth
      if (document.hidden) return;

      try {
        const data = await getSessionStatus();
        const active = data?.activeSession;
        const activeBreak = data?.activeBreak;
        errorCount = 0; // Reset on success

        if (active) {
          // Use 'started_at' (preserved across redeploys) instead of 'created_at' (DB record time)
          const startTime = new Date(active.started_at || active.created_at);
          const totalSeconds = active.planned_duration_sec;

          // Robust validation for session data
          if (isNaN(startTime.getTime()) || typeof totalSeconds !== 'number') {
            if (errorCount === 1 || errorCount % 10 === 0) {
              console.warn("[Session Sync] Received invalid session data:", { 
                started_at: active.started_at,
                created_at: active.created_at, 
                planned_duration_sec: totalSeconds 
              });
            }
            return;
          }

          const endTimeDate = new Date(startTime.getTime() + totalSeconds * 1000);
          if (isNaN(endTimeDate.getTime())) {
            return;
          }
          const endTime = endTimeDate.toISOString();

          setSession((prev) => {
            // Only update if something actually changed
            if (
              prev.status === 'FOCUSING' &&
              prev.subject === active.subject &&
              prev.endTime === endTime
            ) {
              return prev;
            }
            return {
              status: 'FOCUSING',
              isActive: true,
              subject: active.subject,
              startTime: startTime.toISOString(),
              durationSec: totalSeconds,
              endTime,
              blocklist: data.blocklist || [],
            };
          });
        } else if (activeBreak) {
          const startTime = new Date(activeBreak.started_at);
          const durationSec = activeBreak.duration_sec;
          const endTimeDate = new Date(startTime.getTime() + durationSec * 1000);
          const endTime = endTimeDate.toISOString();

          setSession((prev) => {
            if (
              prev.status === 'BREAK' &&
              prev.endTime === endTime &&
              prev.nextSession?.subject === activeBreak.next_session.subject
            ) {
              return prev;
            }
            return {
              status: 'BREAK',
              isActive: false,
              startTime: startTime.toISOString(),
              durationSec,
              endTime,
              nextSession: {
                subject: activeBreak.next_session.subject,
                durationSec: activeBreak.next_session.planned_duration_sec,
              },
              blocklist: activeBreak.next_session.blocklist,
            };
          });
        } else {
          setSession((prev) => (prev.status !== 'IDLE' ? { isActive: false, status: 'IDLE' } : prev));
        }
      } catch (err) {
        errorCount++;
        // Log the first error immediately for debugging, then every 10th
        if (errorCount === 1 || errorCount % 10 === 0) {
          console.error(`[Session Sync] Failed (failure #${errorCount}):`, err);
        }
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
          status: 'FOCUSING',
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

  const handleStop = useCallback(async (reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Pass the blocklist stored in the current session state
      await stopSession(session.blocklist || [], reason);
      setSession({ isActive: false, status: 'IDLE' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to end session";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session.blocklist]);

  const handleStartBreak = useCallback(
    async (breakSeconds: number, subject: string, sessionSeconds: number, blocklist: string[]) => {
      if (!subject.trim()) {
        setError("Subject is required for the next session");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await startBreak(breakSeconds, {
          subject,
          durationSec: sessionSeconds,
          blocklist,
        });

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + breakSeconds * 1000);

        setSession({
          status: 'BREAK',
          isActive: false,
          startTime: startTime.toISOString(),
          durationSec: breakSeconds,
          endTime: endTime.toISOString(),
          nextSession: {
            subject,
            durationSec: sessionSeconds,
          },
          blocklist,
        });
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to start break";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleStopBreak = useCallback(async (reason: string = "manual_stop") => {
    setLoading(true);
    setError(null);
    try {
      await stopBreak(reason);
      // The backend will automatically start a session, syncStatus will pick it up
      // but we can optimistically clear break state
      setSession((prev) => ({ ...prev, status: 'IDLE' })); 
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to skip break";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    session,
    loading,
    error,
    mounted,
    handleStart,
    handleStop,
    handleStartBreak,
    handleStopBreak,
    clearError,
  };
}
