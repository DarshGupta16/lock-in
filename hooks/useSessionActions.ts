import { useCallback } from "react";
import { startSession, stopSession, startBreak, stopBreak, skipBreak } from "@/lib/hia";
import { SessionState } from "@/lib/types";

interface UseSessionActionsProps {
  setSession: (state: SessionState | ((prev: SessionState) => SessionState)) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  session: SessionState;
}

export function useSessionActions({ setSession, setLoading, setError, session }: UseSessionActionsProps) {
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
        const message = err instanceof Error ? err.message : "Failed to initiate session";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setSession, setLoading, setError],
  );

  const handleStop = useCallback(async (reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await stopSession(session.blocklist || [], reason);
      setSession({ isActive: false, status: 'IDLE' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to end session";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session, setSession, setLoading, setError]);

  const handleStartBreak = useCallback(
    async (breakSeconds: number, subject: string, sessionSeconds: number, blocklist: string[]) => {
      if (!subject.trim()) {
        setError("Subject is required for the next session");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await startBreak(breakSeconds, { subject, durationSec: sessionSeconds, blocklist });
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + breakSeconds * 1000);

        setSession({
          status: 'BREAK',
          isActive: false,
          startTime: startTime.toISOString(),
          durationSec: breakSeconds,
          endTime: endTime.toISOString(),
          nextSession: { subject, durationSec: sessionSeconds },
          blocklist,
        });
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to start break";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setSession, setLoading, setError],
  );

  const handleStopBreak = useCallback(async (reason: string) => {
    setLoading(true);
    setError(null);
    try {
      await stopBreak(session.blocklist || [], reason);
      setSession((prev) => ({ ...prev, status: 'IDLE' })); 
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to stop break";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session, setSession, setLoading, setError]);

  const handleSkipBreak = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await skipBreak(session.blocklist || []);
      setSession((prev) => ({ ...prev, status: 'IDLE' })); 
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to skip break";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session, setSession, setLoading, setError]);

  return {
    handleStart,
    handleStop,
    handleStartBreak,
    handleStopBreak,
    handleSkipBreak,
  };
}
