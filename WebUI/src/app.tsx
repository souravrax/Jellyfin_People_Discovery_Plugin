import React, { useRef, useState } from "react";
import { FILTERS, PAGE_SIZE, ROOT_ID } from "./constants.js";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";
import { usePersons } from "./hooks/usePersons.js";
import { useRouteSync } from "./hooks/useRouteSync.js";
import { FilterBar } from "./components/FilterBar.js";
import { PeopleGrid } from "./components/PeopleGrid.js";
import { StatusBar } from "./components/StatusBar.js";
import { Toolbar } from "./components/Toolbar.js";
import { TypeTabs } from "./components/TypeTabs.js";

/** Composes the whole #/people page from hooks + components. */
export function App() {
  const active = useRouteSync();
  const [input, setInput] = useState<string>("");
  const query = useDebouncedValue(input.trim(), 300);
  const [personType, setPersonType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("Ascending");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [compact, setCompact] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { items, total, exhausted, loading, error, loadMore, reset } = usePersons(active, {
    query,
    personType,
    sortOrder,
    isFavorite,
  });

  // Close type menu on outside click
  React.useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const close = (e: MouseEvent): void => {
      if (!(e.target as HTMLElement).closest("[data-typemenu],[data-titlebtn]")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  if (!active) {
    return null;
  }

  const current = FILTERS.find((f) => f.value === personType) || FILTERS[0];
  const end = typeof total === "number" ? Math.min(items.length, total) : items.length;
  const range = typeof total === "number" ? `${total === 0 ? 0 : 1}-${end} of ${total}` : "…";

  const setType = (v: string): void => {
    setMenuOpen(false);
    setPersonType((p) => (p === v ? p : v));
  };

  return (
    <div id={ROOT_ID} data-role="page" className={`bg-ink font-sans text-[#f5f5f5] min-h-screen page mainAnimatedPage libraryPage pageWithAbsoluteTabs withTabs${compact ? " jfCompact" : ""}`} data-backbutton="true">
      <div className="padded-bottom-page MuiBox-root css-0">
        <Toolbar
          title={current.value ? current.label : "People"}
          range={range}
          filterActive={Boolean(personType || query || isFavorite)}
          menuOpen={menuOpen}
          personType={personType}
          prevDisabled={items.length <= PAGE_SIZE}
          nextDisabled={exhausted}
          onTitleClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          onType={setType}
          onToggleFilter={() => setFilterOpen((o) => !o)}
          onToggleSort={() => setSortOrder((s) => (s === "Ascending" ? "Descending" : "Ascending"))}
          onToggleView={() => setCompact((c) => !c)}
          onPrev={reset}
          onNext={loadMore}
        />
        <TypeTabs personType={personType} onType={setType} />
        <FilterBar
          visible={filterOpen}
          input={input}
          sortOrder={sortOrder}
          isFavorite={isFavorite}
          personType={personType}
          onInput={setInput}
          onSortOrder={setSortOrder}
          onFavorite={setIsFavorite}
          onType={setType}
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
