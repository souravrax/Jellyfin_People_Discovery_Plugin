import React from "react";
import { FILTERS, SEARCH_ID } from "../constants.js";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Select } from "../ui/select.js";

interface PeopleHeaderProps {
  input: string;
  personType: string;
  sortOrder: string;
  isFavorite: boolean;
  total: number | null;
  onInput: (v: string) => void;
  onType: (v: string) => void;
  onToggleSort: () => void;
  onToggleFavorite: () => void;
}

/**
 * Masthead + one control strip. The single memorable touch is the velvet
 * rule under the title; everything else stays quiet and disciplined.
 */
export function PeopleHeader(props: PeopleHeaderProps) {
  const { input, personType, sortOrder, isFavorite, total } = props;
  return (
    <div className="px-4 pb-1 pt-5 md:px-6">
      <h1 className="font-heading text-[2rem] font-extrabold leading-none tracking-tight text-foreground">
        People
      </h1>
      <div className="mt-2.5 h-0.5 w-16 rounded-full bg-[#e50914]" aria-hidden="true"></div>
      {typeof total === "number" ? (
        <p className="mt-2 text-sm tabular-nums text-muted-foreground">
            {total.toLocaleString()} {total === 1 ? "person" : "people"}
        </p>
      ) : null}
      <div className="mt-4 flex max-w-3xl flex-wrap items-center gap-2.5">
        <Input
          id={SEARCH_ID}
          className="grow basis-64"
          type="search"
          placeholder="Search cast and crew"
          autoComplete="off"
          aria-label="Search cast and crew"
          value={input}
          onChange={(e) => props.onInput(e.target.value)}
        />
        <Select
          value={personType}
          options={FILTERS}
          onChange={props.onType}
          label="Person type"
        />
        <Button
          variant="secondary"
          title={sortOrder === "Ascending" ? "Sort Z to A" : "Sort A to Z"}
          onClick={props.onToggleSort}
        >
          {sortOrder === "Ascending" ? "A–Z" : "Z–A"}
        </Button>
        <Button
          variant={isFavorite ? "default" : "ghost"}
          size="icon"
          title={isFavorite ? "Show everyone" : "Show favorites only"}
          aria-pressed={isFavorite}
          aria-label="Favorites only"
          onClick={props.onToggleFavorite}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"></path>
          </svg>
        </Button>
      </div>
    </div>
  );
}
