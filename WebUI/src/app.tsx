import React, { useRef, useState } from "react";
import { ROOT_ID } from "./constants.js";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";
import { usePersons } from "./hooks/usePersons.js";
import { useRouteSync } from "./hooks/useRouteSync.js";
import { PeopleGrid } from "./components/PeopleGrid.js";
import { PeopleHeader } from "./components/PeopleHeader.js";
import { StatusBar } from "./components/StatusBar.js";

/** Composes the whole #/people page: header, grid, status. */
export function App() {
  const active = useRouteSync();
  const [input, setInput] = useState<string>("");
  const query = useDebouncedValue(input.trim(), 300);
  const [personType, setPersonType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("Ascending");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { items, total, loading, error, loadMore, reset } = usePersons(active, {
    query,
    personType,
    sortOrder,
  });

  if (!active) {
    return null;
  }

  return (
    <div id={ROOT_ID} data-role="page" className="min-h-screen bg-background font-sans text-foreground page mainAnimatedPage libraryPage" data-backbutton="true">
      <div className="padded-bottom-page MuiBox-root css-0">
        <PeopleHeader
          input={input}
          personType={personType}
          sortOrder={sortOrder}
          total={total}
          onInput={setInput}
          onType={setPersonType}
          onToggleSort={() => setSortOrder((s) => (s === "Ascending" ? "Descending" : "Ascending"))}
        />
        <PeopleGrid
          items={items}
          loading={loading}
          error={error}
          active={active}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
        />
        <StatusBar loading={loading} error={error} onRetry={reset} />
      </div>
    </div>
  );
}
