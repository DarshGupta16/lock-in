import { useEffect } from "react";
import { getSessionStatus } from "@/lib/hia";
import { SessionState } from "@/lib/types";

interface UseSessionSyncProps {
  mounted: boolean;
  setSession: (updater: (prev: SessionState) => SessionState) => void;
}

export function useSessionSync({ mounted, setSession }: UseSessionSyncProps) {
  useEffect(() => {
    if (!mounted) return;

    let errorCount = 0;

    const syncStatus = async () => {
      if (document.hidden) return;

      try {
        const data = await getSessionStatus();
        const active = data?.activeSession;
        const activeBreak = data?.activeBreak;
        errorCount = 0;

        if (active) {
          const startTime = new Date(active.started_at || active.created_at);
          const totalSeconds = active.planned_duration_sec;

          if (isNaN(startTime.getTime()) || typeof totalSeconds !== 'number') return;

          const endTimeDate = new Date(startTime.getTime() + totalSeconds * 1000);
          if (isNaN(endTimeDate.getTime())) return;
          const endTime = endTimeDate.toISOString();

          const currentBlocklist = data.blocklist || active.blocklist || [];

          setSession((prev) => {
            if (
              prev.status === 'FOCUSING' &&
              prev.subject === active.subject &&
              prev.endTime === endTime
            ) {
              return prev;
            }

            if (prev.status === 'BREAK') {
              Promise.resolve().then(() => {
                fetch('/api/hia', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    event_type: 'SYNC_BLOCKLIST', 
                    blocklist: currentBlocklist
                  })
                }).catch(console.error);
              });
            }

            return {
              status: 'FOCUSING',
              isActive: true,
              subject: active.subject,
              startTime: startTime.toISOString(),
              durationSec: totalSeconds,
              endTime,
              blocklist: currentBlocklist,
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
          setSession((prev) => {
            if (prev.status !== 'IDLE') {
              // Session ended automatically (timer expired on backend)
              // Trigger unblocking for the last active blocklist
              const lastBlocklist = prev.blocklist || [];
              Promise.resolve().then(() => {
                fetch('/api/hia', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    event_type: 'SYNC_BLOCKLIST', 
                    blocklist: lastBlocklist
                  })
                }).catch(console.error);
              });
              return { isActive: false, status: 'IDLE' };
            }
            return prev;
          });
        }
      } catch (err) {
        errorCount++;
        if (errorCount === 1 || errorCount % 10 === 0) {
          console.error(`[Session Sync] Failed (failure #${errorCount}):`, err);
        }
      }
    };

    syncStatus();
    const interval = setInterval(syncStatus, 10000);
    document.addEventListener("visibilitychange", syncStatus);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", syncStatus);
    };
  }, [mounted, setSession]);
}
