import React from "react";
import { FILTERS } from "../constants.js";

/** Native library tabs (All / Actors / Directors / …), synced with filters. */
export function TypeTabs({ personType, onType }: { personType: string; onType: (v: string) => void }) {
  return (
    <div className="libraryViewNav secondaryNav px-4 pt-1.5">
      <div className="libraryViewNavInner">
        <div className="emby-tabs">
          <div className="flex gap-1 overflow-x-auto pb-0.5 emby-tabs-slider" data-tabrow="">
            {FILTERS.map((f) => (
              <button
                key={f.label} type="button" data-value={f.value}
                aria-selected={f.value === personType}
                className={`whitespace-nowrap border-b-[3px] border-transparent px-3.5 py-2.5 text-sm font-semibold hover:text-white emby-tab-button${f.value === personType ? " !border-netflix !text-white" : " text-[#b3b3b3]"}`}
                onClick={() => onType(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
