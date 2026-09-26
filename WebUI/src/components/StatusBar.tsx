import React from "react";
import { STATUS_ID } from "../constants.js";
import { Button } from "../ui/button.js";

/** Loading / error status line with retry. */
export function StatusBar({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
  return (
    <div id={STATUS_ID} className="px-4 py-10 text-center text-sm text-muted-foreground">
      {loading ? "Loading…" : ""}
      {error ? (
        <div className="flex flex-col items-center gap-3">
          <p>Failed to load: {error}</p>
          <Button variant="secondary" size="sm" type="button" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
