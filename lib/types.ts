import { z } from "zod";

export enum EventType {
  SESSION_START = "SESSION_START",
  SESSION_STOP = "SESSION_STOP",
  BREAK_START = "BREAK_START",
  BREAK_STOP = "BREAK_STOP",
}

export const SessionStartSchema = z.object({
  event_type: z.literal(EventType.SESSION_START),
  timestamp: z.string().datetime(),
  subject: z.string().min(1, "Subject is required"),
  planned_duration_sec: z.number().positive("Duration must be positive"),
  blocklist: z.array(z.string()),
});

export const BreakStartSchema = z.object({
  event_type: z.literal(EventType.BREAK_START),
  timestamp: z.string().datetime(),
  duration_sec: z.number().positive(),
  next_session: z.object({
    subject: z.string().min(1),
    planned_duration_sec: z.number().positive(),
    blocklist: z.array(z.string()),
  }),
});

export type SessionStart = z.infer<typeof SessionStartSchema>;
export type BreakStart = z.infer<typeof BreakStartSchema>;

export interface SessionState {
  status: 'IDLE' | 'FOCUSING' | 'BREAK';
  isActive: boolean; // Keep for backward compatibility/simpler checks
  subject?: string;
  startTime?: string;
  durationSec?: number;
  endTime?: string;
  blocklist?: string[];
  nextSession?: {
    subject: string;
    durationSec: number;
  };
}
