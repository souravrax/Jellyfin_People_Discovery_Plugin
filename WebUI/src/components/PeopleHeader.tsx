import React from "react";
import { FILTERS, SEARCH_ID } from "../constants.js";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Select } from "../ui/select.js";

interface PeopleHeaderProps {
  input: string;
  personType: string;
  sortOrder: string;
  total: number | null;
  onInput: (v: string) => void;
  onType: (v: string) => void;
  onToggleSort: () => void;
}

/**
 * Masthead + one control strip. The single memorable touch is the velvet
 * rule under the title; everything else stays quiet and disciplined.
 */
export function PeopleHeader(props: PeopleHeaderProps) {
  const { input, personType, sortOrder, total } = props;
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
      </div>
    </div>
  );
}
