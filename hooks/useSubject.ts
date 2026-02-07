"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lock-in-subject";

export function useSubject() {
  // Lazy initialization from localStorage (runs once, no cascading render)
  const [subject, setSubject] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) || "";
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, subject);
  }, [subject]);

  const updateSubject = useCallback((value: string) => {
    setSubject(value);
  }, []);

  return {
    subject,
    updateSubject,
  };
}
