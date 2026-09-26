import React, { useEffect, useState } from "react";
import { ROOT_ID } from "./constants.js";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";
import { usePersons } from "./hooks/usePersons.js";
import { useRouteSync } from "./hooks/useRouteSync.js";
import { Pager } from "./components/Pager.js";
import { PeopleGrid } from "./components/PeopleGrid.js";
import { PeopleHeader } from "./components/PeopleHeader.js";
import { StatusBar } from "./components/StatusBar.js";

/** Composes the whole #/people page: header, grid, pager, status. */
export function App() {
  const active = useRouteSync();
  const [input, setInput] = useState<string>("");
  const debouncedInput = useDebouncedValue(input.trim(), 300);
  const [query, setQuery] = useState<string>("");
  const [personType, setPersonType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("Ascending");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const { items, total, loading, error, range, hasPrev, hasNext, prev, next, reset } =
    usePersons(active, { query, personType, sortOrder, isFavorite });

  // New search text always starts back on page 1 (batched → single fetch).
  useEffect(() => {
    setQuery(debouncedInput);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  if (!active) {
    return null;
  }

  const changeFilter = (fn: () => void): void => {
    fn();
    reset();
  };

  return (
    <div id={ROOT_ID} data-role="page" className="min-h-screen bg-background font-sans text-foreground page mainAnimatedPage libraryPage" data-backbutton="true">
      <div className="padded-bottom-page MuiBox-root css-0">
        <PeopleHeader
          input={input}
          personType={personType}
          sortOrder={sortOrder}
          isFavorite={isFavorite}
          total={total}
          onInput={setInput}
          onType={(v) => changeFilter(() => setPersonType(v))}
          onToggleSort={() =>
            changeFilter(() =>
              setSortOrder((s) => (s === "Ascending" ? "Descending" : "Ascending"))
            )
          }
          onToggleFavorite={() => changeFilter(() => setIsFavorite((f) => !f))}
        />
        <PeopleGrid items={items} loading={loading} error={error} />
        <Pager range={range} hasPrev={hasPrev} hasNext={hasNext} onPrev={prev} onNext={next} />
        <StatusBar error={error} onRetry={reset} />
      </div>
    </div>
  );
}
