import React from "react";
import { FILTERS, SEARCH_ID, SORT_ORDERS } from "../constants.js";

interface FilterBarProps {
  visible: boolean;
  input: string;
  sortOrder: string;
  isFavorite: boolean;
  personType: string;
  onInput: (v: string) => void;
  onSortOrder: (v: string) => void;
  onFavorite: (v: boolean) => void;
  onType: (v: string) => void;
}

/** Collapsible filter panel: search, sort, favorites, type pills. */
export function FilterBar(props: FilterBarProps) {
  const { visible, input, sortOrder, isFavorite, personType } = props;
  return (
    <div className="px-4 pt-1.5 jfPeopleHead" data-filterbar="" hidden={!visible}>
      <div className="my-3 flex flex-wrap items-center gap-2.5 jfPeopleRow">
        <input
          id={SEARCH_ID} className="max-w-md grow basis-64 rounded-md border border-[#4d4d4d] bg-[#333] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-[#8c8c8c] focus:border-netflix focus:ring-2 focus:ring-netflix/35 emby-input" type="search"
          placeholder="Search people" autoComplete="off" aria-label="Search people"
          value={input} onChange={(e) => props.onInput(e.target.value)}
        />
      </div>
      <div className="my-3 flex flex-wrap items-center gap-2.5 jfPeopleRow jfFilterBar">
        <span className="flex items-center gap-2 jfFilterField">
          <label htmlFor="jfSortOrder" className="text-xs font-semibold text-[#b3b3b3]">Sort</label>
          <select id="jfSortOrder" className="min-w-36 cursor-pointer rounded-md border border-[#4d4d4d] bg-[#333] px-3 py-2 text-sm text-white emby-select" value={sortOrder} onChange={(e) => props.onSortOrder(e.target.value)}>
            {SORT_ORDERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </span>
        <span className="flex items-center gap-2 jfFilterField">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#ddd] checkboxContainer">
            <input type="checkbox" className="h-[1.1rem] w-[1.1rem] cursor-pointer accent-netflix emby-checkbox" checked={isFavorite} onChange={(e) => props.onFavorite(e.target.checked)} />
            <span className="checkboxLabel">Favorites only</span>
          </label>
        </span>
      </div>
      <div className="my-3 flex flex-wrap items-center gap-2.5 jfPeopleRow jfTypeRow" role="group" aria-label="Person type">
        {FILTERS.map((f) => (
          <button
            key={f.label} type="button" data-value={f.value}
            aria-pressed={f.value === personType}
            className={`rounded-full px-4 py-2 text-xs font-bold active:scale-95 MuiButtonBase-root MuiToggleButton-root MuiToggleButton-sizeSmall MuiToggleButton-primary css-eee7z4${f.value === personType ? " border-netflix bg-netflix text-white" : " border-white/20 bg-white/10 text-[#e8e8e8] hover:bg-white/20 hover:text-white"}`}
            onClick={() => props.onType(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
