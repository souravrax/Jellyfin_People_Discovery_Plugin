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

/** The whole header: title, count, search, type, sort. Nothing else. */
export function PeopleHeader(props: PeopleHeaderProps) {
  const { input, personType, sortOrder, total } = props;
  return (
    <div className="px-4 pb-1 pt-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-wide text-foreground">People</h1>
        {typeof total === "number" ? (
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} {total === 1 ? "person" : "people"}
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Input
          id={SEARCH_ID}
          className="max-w-md grow basis-64"
          type="search"
          placeholder="Search people"
          autoComplete="off"
          aria-label="Search people"
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
          title={sortOrder === "Ascending" ? "Sort descending" : "Sort ascending"}
          onClick={props.onToggleSort}
        >
          {sortOrder === "Ascending" ? "A–Z" : "Z–A"}
        </Button>
      </div>
    </div>
  );
}
