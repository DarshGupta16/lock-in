import { SessionStart, EventType } from "./types";

const PROXY_URL = "/api/hia";

export async function startSession(subject: string, durationSec: number, blocklist: string[]) {
  const payload: SessionStart = {
    event_type: EventType.SESSION_START,
    timestamp: new Date().toISOString(),
    subject,
    planned_duration_sec: durationSec,
    blocklist,
  };

  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to start session: ${response.statusText}`);
  }

  return response.json();
}

export async function stopSession(reason: string = "manual_end") {
  const payload = {
    event_type: EventType.SESSION_STOP,
    timestamp: new Date().toISOString(),
    reason,
  };

  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to stop session: ${response.statusText}`);
  }

  return response.json();
}