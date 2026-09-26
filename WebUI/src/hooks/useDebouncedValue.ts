import { useEffect, useState } from "react";

/** Debounces a fast-changing value (search input → query). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced((prev) => (prev === value ? prev : value));
    }, delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
