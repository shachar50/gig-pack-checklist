import { useSyncExternalStore } from "react";

type Listener = () => void;

/**
 * Tiny localStorage-backed store shared across every component that uses it.
 * Every hook instance sees the same data and re-renders on writes.
 */
export function createLocalStore<T>(options: {
  key: string;
  seed: () => T;
  empty: T;
  migrate?: (raw: unknown) => T | null;
}) {
  const { key, seed, empty, migrate } = options;
  let cache: T | null = null;
  const listeners = new Set<Listener>();

  function read(): T {
    if (cache !== null) return cache;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        cache = seed();
        localStorage.setItem(key, JSON.stringify(cache));
      } else {
        const parsed: unknown = JSON.parse(raw);
        const migrated = migrate ? migrate(parsed) : (parsed as T);
        cache = migrated ?? seed();
        if (migrate && migrated !== parsed) localStorage.setItem(key, JSON.stringify(cache));
      }
    } catch {
      cache = seed();
    }
    return cache;
  }

  function set(next: T) {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
    listeners.forEach((l) => l());
  }

  function update(fn: (current: T) => T) {
    set(fn(read()));
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, read, () => empty);
  }

  return { read, set, update, subscribe, useStore };
}

const noop = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
