"use client";

import { useEffect, useRef, useState } from "react";

export function usePersistentState<T>(
  key: string,
  seed: T,
  parse: (value: unknown) => T | null,
) {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);
  const loadedKey = useRef<string | null>(null);

  useEffect(() => {
    if (loadedKey.current === key) return;
    loadedKey.current = key;

    let next = seed;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = parse(JSON.parse(raw) as unknown);
        if (parsed !== null) next = parsed;
      }
    } catch {
      next = seed;
    }

    setValue(next);
    setHydrated(true);
  }, [key, parse, seed]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore private-mode and quota errors. The list still works in memory.
    }
  }, [hydrated, key, value]);

  return { value, setValue, hydrated };
}
