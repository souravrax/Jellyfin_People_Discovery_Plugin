import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPersons, waitForApi, type PersonItem } from "../api.js";
import { PAGE_SIZE } from "../constants.js";

export interface PersonsFilter {
  query: string;
  personType: string;
  sortOrder: string;
  isFavorite: boolean;
}

export interface PersonsState {
  items: PersonItem[];
  total: number | null;
  loading: boolean;
  error: string;
  /** 1-based current page. */
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  /** "1–100 of 1,240" (or "…" while unknown). */
  range: string;
  prev: () => void;
  next: () => void;
  /** Back to page 1 (filters) or refetch (retry). */
  reset: () => void;
}

/**
 * Windowed /Persons paging (limit + startIndex query params). One page is
 * one request; changing pages replaces the list — no accumulation, so Prev
 * always works and the range text is exact.
 */
export function usePersons(active: boolean, filter: PersonsFilter): PersonsState {
  const [items, setItems] = useState<PersonItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [attempt, setAttempt] = useState<number>(0);

  const genRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      return;
    }
    const gen = ++genRef.current;
    setItems([]);
    setTotal(null);
    setError("");
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await waitForApi();
        if (cancelled || gen !== genRef.current) {
          return;
        }
        const res = await fetchPersons({
          startIndex: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          searchTerm: filter.query,
          personType: filter.personType,
          sortOrder: filter.sortOrder,
          isFavorite: filter.isFavorite,
        });
        if (cancelled || gen !== genRef.current) {
          return;
        }
        setItems(Array.isArray(res?.Items) ? res.Items : []);
        if (typeof res?.TotalRecordCount === "number") {
          setTotal(res.TotalRecordCount);
        }
      } catch (e) {
        if (!cancelled && gen === genRef.current) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled && gen === genRef.current) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, page, attempt, filter.query, filter.personType, filter.sortOrder, filter.isFavorite]);

  const prev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const next = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setAttempt((a) => a + 1);
  }, []);

  const hasPrev = page > 1;
  const hasNext =
    typeof total === "number" ? page * PAGE_SIZE < total : items.length >= PAGE_SIZE;
  const range =
    typeof total === "number"
      ? total === 0
        ? "0 of 0"
        : `${((page - 1) * PAGE_SIZE + 1).toLocaleString()}–${Math.min(page * PAGE_SIZE, total).toLocaleString()} of ${total.toLocaleString()}`
      : "…";

  return { items, total, loading, error, page, hasPrev, hasNext, range, prev, next, reset };
}
