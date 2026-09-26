import React from "react";
import { GRID_ID } from "../constants.js";
import type { PersonItem } from "../api.js";
import { PersonCard } from "./PersonCard.js";

interface PeopleGridProps {
  items: PersonItem[];
  loading: boolean;
  error: string;
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

/** Our own responsive grid + empty state. Paging replaces infinite scroll. */
export function PeopleGrid({ items, loading, error }: PeopleGridProps) {
  const showSkeletons = loading && items.length === 0;

  return (
    <div id={GRID_ID} className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] items-start gap-x-4 gap-y-7 px-4 pb-2 pt-2 md:px-6 max-md:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] max-md:gap-x-3 max-md:gap-y-5">
      {showSkeletons ? (
        Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)
      ) : items.length === 0 && !error ? (
        <div className="col-span-full px-4 py-20 text-center">
          <p className="font-heading text-xl font-bold text-foreground">Nobody here</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search.</p>
        </div>
      ) : (
        items.map((p) => <PersonCard key={`${p.Id}-${p.PersonType || ""}`} person={p} />)
      )}
    </div>
  );
}
