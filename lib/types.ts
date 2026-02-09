import { z } from "zod";

export enum EventType {
  SESSION_START = "SESSION_START",
  SESSION_STOP = "SESSION_STOP",
}

export const SessionStartSchema = z.object({
  event_type: z.literal(EventType.SESSION_START),
  timestamp: z.string().datetime(),
  subject: z.string().min(1, "Subject is required"),
  planned_duration_sec: z.number().positive("Duration must be positive"),
  blocklist: z.array(z.string()),
});

export type SessionStart = z.infer<typeof SessionStartSchema>;

export interface SessionState {
  isActive: boolean;
  subject?: string;
  startTime?: string;
  durationSec?: number;
  endTime?: string;
  blocklist?: string[];
}
