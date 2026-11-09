"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "lumina:studio:session";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cachedSession = null;
const listeners = new Set();

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getSessionId() {
  if (typeof window === "undefined") return null;
  if (cachedSession) return cachedSession;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && UUID_PATTERN.test(stored)) {
      cachedSession = stored;
      return cachedSession;
    }

    const created = createId();
    window.localStorage.setItem(STORAGE_KEY, created);
    cachedSession = created;
    return cachedSession;
  } catch {
    cachedSession = cachedSession || createId();
    return cachedSession;
  }
}

function subscribe(callback) {
  listeners.add(callback);
  if (typeof window === "undefined") {
    return () => listeners.delete(callback);
  }

  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      cachedSession = null;
      callback();
    }
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot() {
  return null;
}

export function useStudioSession() {
  return useSyncExternalStore(subscribe, getSessionId, getServerSnapshot);
}

export { getSessionId, STORAGE_KEY, UUID_PATTERN };
