import React from "react";
import { STATUS_ID } from "../constants.js";
import { Button } from "../ui/button.js";

/** Error line with a way forward. Loading is shown as skeletons in the grid. */
export function StatusBar({ error, onRetry }: { error: string; onRetry: () => void }) {
  if (!error) {
    return <div id={STATUS_ID}></div>;
  }
  return (
    <div id={STATUS_ID} className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-muted-foreground">
      <p>Couldn&apos;t load people. Check your connection and retry.</p>
      <Button variant="secondary" size="sm" type="button" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
