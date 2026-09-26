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
  exhausted: boolean;
  loading: boolean;
  error: string;
  loadMore: () => void;
  /** Clears to page 1 and reloads (filters, retry, prev-page). */
  reset: () => void;
}

/** Paginated /Persons loading with race guards and infinite-scroll support. */
export function usePersons(active: boolean, filter: PersonsFilter): PersonsState {
  const [items, setItems] = useState<PersonItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [exhausted, setExhausted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [resetToken, setResetToken] = useState<number>(0);

  const genRef = useRef<number>(0);
  const loadingRef = useRef<boolean>(false);
  const exhaustedRef = useRef<boolean>(false);
  const filterRef = useRef<PersonsFilter>(filter);
  filterRef.current = filter;
  loadingRef.current = loading;
  exhaustedRef.current = exhausted;

  // Reset + load page 1 whenever filters (or resetToken) change.
  useEffect(() => {
    if (!active) {
      return;
    }
    const gen = ++genRef.current;
    setItems([]);
    setTotal(null);
    setExhausted(false);
    setError("");
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await waitForApi();
        if (cancelled || gen !== genRef.current) {
          return;
        }
        const f = filterRef.current;
        const res = await fetchPersons({
          startIndex: 0,
          limit: PAGE_SIZE,
          searchTerm: f.query,
          personType: f.personType,
          sortOrder: f.sortOrder,
          isFavorite: f.isFavorite,
        });
        if (cancelled || gen !== genRef.current) {
          return;
        }
        const list = Array.isArray(res?.Items) ? res.Items : [];
        if (typeof res?.TotalRecordCount === "number") {
          setTotal(res.TotalRecordCount);
        }
        setItems(list);
        const done =
          list.length < PAGE_SIZE ||
          (typeof res?.TotalRecordCount === "number" && list.length >= res.TotalRecordCount);
        setExhausted(done);
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
  }, [active, resetToken, filter.query, filter.personType, filter.sortOrder, filter.isFavorite]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhaustedRef.current) {
      return;
    }
    const gen = genRef.current;
    setLoading(true);
    setError("");
    try {
      const f = filterRef.current;
      const res = await fetchPersons({
        startIndex: items.length,
        limit: PAGE_SIZE,
        searchTerm: f.query,
        personType: f.personType,
        sortOrder: f.sortOrder,
        isFavorite: f.isFavorite,
      });
      if (gen !== genRef.current) {
        return;
      }
      const list = Array.isArray(res?.Items) ? res.Items : [];
      if (typeof res?.TotalRecordCount === "number") {
        setTotal(res.TotalRecordCount);
      }
      setItems((prev) => {
        const next = prev.concat(list);
        const done =
          list.length < PAGE_SIZE ||
          (typeof res?.TotalRecordCount === "number" && next.length >= res.TotalRecordCount);
        setExhausted(done);
        return next;
      });
    } catch (e) {
      if (gen === genRef.current) {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      if (gen === genRef.current) {
        setLoading(false);
      }
    }
  }, [items.length]);

  const reset = useCallback(() => {
    setResetToken((t) => t + 1);
  }, []);

  return { items, total, exhausted, loading, error, loadMore, reset };
}
