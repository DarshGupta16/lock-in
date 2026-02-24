import { SessionStart, EventType, BreakStart } from "./types";

const PROXY_URL = "/api/hia";

async function hiaRequest<T>(method: string, body?: any): Promise<T> {
  const options: RequestInit = {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: method === "GET" ? "no-store" : undefined,
  };

  const response = await fetch(PROXY_URL, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HIA API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getSessionStatus() {
  return hiaRequest<any>("GET");
}

export async function startSession(subject: string, durationSec: number, blocklist: string[]) {
  const payload: SessionStart = {
    event_type: EventType.SESSION_START,
    timestamp: new Date().toISOString(),
    subject,
    planned_duration_sec: durationSec,
    blocklist,
  };

  return hiaRequest<any>("POST", payload);
}

export async function stopSession(blocklist: string[] = [], reason: string = "manual_end") {
  const payload = {
    event_type: EventType.SESSION_STOP,
    timestamp: new Date().toISOString(),
    reason,
    blocklist,
  };

  return hiaRequest<any>("POST", payload);
}

export async function startBreak(
  durationSec: number,
  nextSession: { subject: string; durationSec: number; blocklist: string[] }
) {
  const payload: BreakStart = {
    event_type: EventType.BREAK_START,
    timestamp: new Date().toISOString(),
    duration_sec: durationSec,
    next_session: {
      subject: nextSession.subject,
      planned_duration_sec: nextSession.durationSec,
      blocklist: nextSession.blocklist,
    },
  };

  return hiaRequest<any>("POST", payload);
}

export async function stopBreak(blocklist: string[] = [], reason: string) {
  const payload = {
    event_type: EventType.BREAK_STOP,
    timestamp: new Date().toISOString(),
    reason,
    blocklist,
  };

  return hiaRequest<any>("POST", payload);
}

export async function skipBreak(blocklist: string[] = []) {
  const payload = {
    event_type: EventType.BREAK_SKIP,
    timestamp: new Date().toISOString(),
    blocklist,
  };

  return hiaRequest<any>("POST", payload);
}
