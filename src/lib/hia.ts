import { SessionStart, EventType } from "./types";

const API_URL = process.env.NEXT_PUBLIC_HIA_API_URL || "https://hold-idiot-accountable.onrender.com/api/webhooks/ingest";
const ACCESS_KEY = process.env.HIA_ACCESS_KEY;

export async function startSession(subject: string, durationMin: number) {
  if (!ACCESS_KEY) {
    throw new Error("HIA_ACCESS_KEY is not configured");
  }

  const payload: SessionStart = {
    event_type: EventType.SESSION_START,
    timestamp: new Date().toISOString(),
    subject,
    planned_duration_sec: durationMin * 60,
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hia-access-key": ACCESS_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to start session: ${response.statusText}`);
  }

  return response.json();
}
