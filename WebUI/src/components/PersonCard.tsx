import React, { useState } from "react";
import { personHref, personImageUrl, type PersonItem } from "../api.js";

/** Our own portrait card — zero Jellyfin classes, fully self-styled. */
export function PersonCard({ person }: { person: PersonItem }) {
  const name = person.Name || "Unknown";
  const url = person.Id ? personImageUrl(person) : "";
  const initial = String(name).trim().charAt(0).toUpperCase() || "?";
  const href = person.Id ? personHref(person) : "#/people";
  const [imgOk, setImgOk] = useState(true);
  return (
    <a
      href={href}
      title={name}
      data-id={person.Id || ""}
      className="group block min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative block aspect-[2/3] overflow-hidden rounded-md bg-white/[0.06] shadow-sm transition duration-150 group-hover:scale-[1.03] group-hover:shadow-xl">
        {url && imgOk ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            onError={() => setImgOk(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white/25" aria-hidden="true">
            {initial}
          </span>
        )}
      </span>
      <span className="mt-2 block truncate text-center text-[0.95rem] font-semibold leading-snug text-foreground">
        {name}
      </span>
      {person.PersonType ? (
        <span className="mt-0.5 block truncate text-center text-xs text-muted-foreground">
          {person.PersonType}
        </span>
      ) : null}
    </a>
  );
}
