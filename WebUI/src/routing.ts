// Jellyfin DOM integration: route detection, content host, native page
// hide/restore, fallback page, header nav entry. No React here — plain DOM
// so it works even where React doesn't reach (the app header).

import { HASH, MOUNT_ID, PEOPLE_ICON_D, ROOT_ID } from "./constants.js";

export const isPeopleRoute = (): boolean => {
  const h = window.location.hash || "";
  return h === HASH || h.startsWith(HASH + "?") || h.startsWith(HASH + "/");
};

export const findHost = (): Element | null =>
  document.querySelector(".mainAnimatedPages") ||
  document.querySelector("main") ||
  document.querySelector("[role='main']");

export function nativePages(host: Element | null): Element[] {
  if (!host) {
    return [];
  }
  return [...host.children].filter(
    (n) => n.nodeType === 1 && (n as HTMLElement).id !== ROOT_ID && (n as HTMLElement).id !== MOUNT_ID
  );
}

export function hideNativePages(host: Element | null): void {
  nativePages(host).forEach((n) => {
    const el = n as HTMLElement;
    if (!el.hasAttribute("data-jf-orig")) {
      el.setAttribute("data-jf-orig", el.style.display || "");
    }
    el.style.display = "none";
  });
}

export function showAllNativePages(): void {
  document.querySelectorAll("[data-jf-orig]").forEach((n) => {
    const el = n as HTMLElement;
    el.style.display = el.getAttribute("data-jf-orig") || "";
    el.removeAttribute("data-jf-orig");
  });
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
