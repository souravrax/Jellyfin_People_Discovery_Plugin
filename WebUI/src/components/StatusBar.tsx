import React from "react";
import { STATUS_ID } from "../constants.js";

/** Loading / error status line with retry. */
export function StatusBar({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
  return (
    <div id={STATUS_ID} className="px-4 py-10 text-center text-[#b3b3b3]">
      {loading ? "Loading…" : ""}
      {error ? (
        <>
          Failed to load: {error}{" "}
          <button
            className="mt-4 rounded-md bg-netflix px-6 py-2.5 font-bold text-white hover:bg-[#f6121d] emby-button" id="jfRetry" type="button"
            onClick={onRetry}
          >
            Retry
          </button>
        </>
      ) : null}
    </div>
  );
}
