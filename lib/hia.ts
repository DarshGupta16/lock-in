import { SessionStart, EventType } from "./types";

const PROXY_URL = "/api/hia";

export async function getSessionStatus() {
  const response = await fetch(PROXY_URL, {
    method: "GET",
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }

  return response.json();
}

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

export async function stopSession(blocklist: string[] = [], reason: string = "manual_end") {
  const payload = {
    event_type: EventType.SESSION_STOP,
    timestamp: new Date().toISOString(),
    reason,
    blocklist, // Include so secondary webhook on server knows what was blocked
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