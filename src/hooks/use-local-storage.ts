import { useCallback, useEffect, useState } from "react";

/**
 * Persist a piece of state to localStorage. SSR/private-mode safe (falls back to
 * in-memory state if storage is unavailable) and validates on read via `parse`
 * so corrupt or stale stored data can never crash the app.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parse: (raw: unknown) => T | null = (raw) => raw as T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue, parse));

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage full or unavailable — keep in-memory value */
        }
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue(initialValue);
  }, [key, initialValue]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) setValue(readStorage(key, initialValue, parse));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, initialValue, parse]);

  return [value, set, remove];
}

function readStorage<T>(key: string, fallback: T, parse: (raw: unknown) => T | null): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = parse(JSON.parse(raw));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
