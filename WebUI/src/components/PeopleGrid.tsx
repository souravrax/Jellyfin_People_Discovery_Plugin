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

  return (
    <>
      <div className="itemsContainer padded-left padded-right vertical-wrap MuiBox-root css-0" id={GRID_ID}>
        {items.length === 0 && !loading && !error ? (
          <div className="noItemsMessage centerMessage MuiBox-root css-0">
            <h1 className="MuiTypography-root MuiTypography-h1">Nothing here.</h1>
            <p className="MuiTypography-root MuiTypography-body1">No people found.</p>
          </div>
        ) : (
          items.map((p) => <PersonCard key={`${p.Id}-${p.PersonType || ""}`} person={p} />)
        )}
      </div>
      <div id="jfPeopleSentinel" ref={sentinelRef} className="h-px w-full"></div>
    </>
  );
}
