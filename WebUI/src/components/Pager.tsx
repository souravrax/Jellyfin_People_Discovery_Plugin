import React from "react";
import { Button } from "../ui/button.js";

interface PagerProps {
  range: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Quiet pager under the grid: Previous · range · Next. */
export function Pager({ range, hasPrev, hasNext, onPrev, onNext }: PagerProps) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 pt-2 pb-14">
      <Button variant="secondary" size="sm" type="button" disabled={!hasPrev} onClick={onPrev}>
        Previous
      </Button>
      <p className="min-w-28 text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
        {range}
      </p>
      <Button variant="secondary" size="sm" type="button" disabled={!hasNext} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
