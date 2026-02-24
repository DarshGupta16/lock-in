"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionState } from "@/lib/types";
import { useSessionSync } from "./useSessionSync";
import { useSessionActions } from "./useSessionActions";

const STORAGE_KEY = "lock-in-session";

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
  const [session, setSession] = useState<SessionState>(getInitialSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session.isActive || session.status === 'BREAK') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  // Use sub-hooks for sync and actions
  useSessionSync({ mounted, setSession });
  
  const actions = useSessionActions({ 
    setSession, 
    setLoading, 
    setError, 
    session 
  });

  const clearError = useCallback(() => setError(null), []);

  return {
    session,
    loading,
    error,
    mounted,
    ...actions,
    clearError,
  };
}
