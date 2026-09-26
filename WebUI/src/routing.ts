// Jellyfin DOM integration: route detection, overlay mount, fallback page,
// header nav entry. No React here — plain DOM so it works even where React
// doesn't reach (the app header).
//
// SAFETY MODEL: we never touch Jellyfin's own nodes (no hiding, no inline
// styles, no attributes on them). Our UI lives in #jfPeopleMount, a
// fixed-position overlay attached to <body> that sits below the app header
// and above the bottom nav. Off-route it is a single hidden node, so other
// pages cannot be affected by us.

import { HASH, MOUNT_ID, PEOPLE_ICON_D } from "./constants.js";

export const isPeopleRoute = (): boolean => {
  const h = window.location.hash || "";
  return h === HASH || h.startsWith(HASH + "?") || h.startsWith(HASH + "/");
};

export function setOverlayVisible(on: boolean): void {
  // The mount node is owned by bootstrap (which also builds the shadow
  // root); if it isn't there yet there is nothing to show or hide.
  const mount = document.getElementById(MOUNT_ID) as HTMLElement | null;
  if (!mount) {
    return;
  }
  if (on) {
    positionOverlay();
    mount.hidden = false;
  } else {
    mount.hidden = true;
  }
}

/**
 * Fits the overlay between Jellyfin's chrome: below the app header, above
 * any bottom navigation. Measured live so theme/layout changes can't trap
 * clicks under (or above) our layer.
 */
export function positionOverlay(): void {
  const mount = document.getElementById(MOUNT_ID);
  if (!mount) {
    return;
  }
  const el = mount as HTMLElement;
  const header = document.querySelector("header");
  const top = header ? Math.max(0, Math.ceil(header.getBoundingClientRect().bottom)) : 0;
  const bottomNav = document.querySelector(".MuiBottomNavigation-root");
  const bottom = bottomNav
    ? Math.max(0, Math.ceil(window.innerHeight - bottomNav.getBoundingClientRect().top))
    : 0;
  el.style.top = `${top}px`;
  el.style.bottom = `${bottom}px`;
}

// Jellyfin renders #fallbackPage (unknown-route page) for custom hashes
// like #/people. Hide it while our route is active, restore otherwise.
export function updateFallback(): void {
  const fallbackPage = document.getElementById("fallbackPage");
  if (!fallbackPage) {
    return;
  }
  fallbackPage.style.display = isPeopleRoute() ? "none" : "";
}

// Header "People" entry: clones the Favorites header link (same MUI
// styling), relabels it, swaps in the people glyph, points at #/people.
export function addPeopleNav(): void {
  const stack = document.querySelector("header .MuiToolbar-root > .MuiStack-root");
  const favorite = [...((stack && stack.querySelectorAll("a")) || [])].find(
    (a) => (a.textContent || "").trim() === "Favorites"
  );

  if (!stack || !favorite) {
    return;
  }

  let people = stack.querySelector("[data-custom-people]") as HTMLElement | null;
  if (!people) {
    const clone = favorite.cloneNode(true) as HTMLElement;
    clone.dataset.customPeople = "true";
    (clone as HTMLAnchorElement).href = "#/people";

    [...clone.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = "People";
      }
    });

    const path = clone.querySelector("svg path");
    if (path) {
      path.setAttribute("d", PEOPLE_ICON_D);
    }

    stack.appendChild(clone);
    people = clone;
  }

  // Active state: Jellyfin can't mark an unknown route active itself.
  const on = isPeopleRoute();
  people.classList.toggle("Mui-selected", on);
  if (on) {
    people.setAttribute("aria-current", "page");
  } else {
    people.removeAttribute("aria-current");
  }
}
