import React, { useEffect } from "react";
import { GRID_ID } from "../constants.js";
import type { PersonItem } from "../api.js";
import { PersonCard } from "./PersonCard.js";

interface PeopleGridProps {
  items: PersonItem[];
  loading: boolean;
  error: string;
  active: boolean;
  sentinelRef: React.RefObject<HTMLDivElement>;
  onLoadMore: () => void;
}

/** Shimmer portrait placeholder — the one orchestrated loading moment. */
function SkeletonCard() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[2/3] animate-pulse rounded-md bg-white/[0.07]"></div>
      <div className="mx-auto mt-2.5 h-3.5 w-3/4 animate-pulse rounded bg-white/[0.07]"></div>
    </div>
  );
}

/** Native itemsContainer grid + empty state + infinite-scroll sentinel. */
export function PeopleGrid({ items, loading, error, active, sentinelRef, onLoadMore }: PeopleGridProps) {
  useEffect(() => {
    if (!active) {
      return;
    }
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const ob = new IntersectionObserver(
      (es) => {
        if (es[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "900px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [active, onLoadMore, sentinelRef]);

  const showSkeletons = loading && items.length === 0;

  return (
    <>
      <div className="itemsContainer padded-left padded-right vertical-wrap MuiBox-root css-0" id={GRID_ID}>
        {showSkeletons ? (
          Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 && !error ? (
          <div className="noItemsMessage centerMessage MuiBox-root css-0">
            <h1 className="MuiTypography-root MuiTypography-h1">Nobody here</h1>
            <p className="MuiTypography-root MuiTypography-body1">Try a different search.</p>
          </div>
        ) : (
          <>
            {items.map((p) => <PersonCard key={`${p.Id}-${p.PersonType || ""}`} person={p} />)}
            {loading
              ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={`more-${i}`} />)
              : null}
          </>
        )}
      </div>
      <div id="jfPeopleSentinel" ref={sentinelRef} className="h-px w-full"></div>
    </>
  );
}
