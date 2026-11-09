"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "lumina:advanced:completed";
const CHANGE_EVENT = "lumina:advanced:progress";

function readCompleted() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeCompleted(value) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: value }));
}

function subscribe(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return JSON.stringify(readCompleted());
}

function getServerSnapshot() {
  return "[]";
}

export function useAdvancedProgress() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const completed = useMemo(() => {
    try {
      return JSON.parse(snapshot);
    } catch {
      return [];
    }
  }, [snapshot]);

  const toggle = useCallback((slug) => {
    const current = readCompleted();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    writeCompleted(next);
  }, []);

  const markComplete = useCallback((slug) => {
    const current = readCompleted();
    if (!current.includes(slug)) {
      writeCompleted([...current, slug]);
    }
  }, []);

  const reset = useCallback(() => writeCompleted([]), []);

  return {
    completed,
    ready: true,
    isComplete: (slug) => completed.includes(slug),
    toggle,
    markComplete,
    reset
  };
}
