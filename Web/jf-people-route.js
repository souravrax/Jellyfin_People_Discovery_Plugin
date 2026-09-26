// jf-people-route.js - requires jf-people-page.js loaded first
// Ownership: #/people routing only. No UI, no API.
//
// SAFETY MODEL: we never touch Jellyfin's own nodes. Our UI lives in
// #jfPeopleMount, a fixed overlay attached to <body>. Off-route it is a
// single hidden node, so other pages cannot be affected by us.
(() => {
  "use strict";
  if (window.__JF_PEOPLE_ROUTE__) return;
  window.__JF_PEOPLE_ROUTE__ = true;

  const HASH = "#/people"; // change to "#/peoples" if you want that URL
  const MOUNT_ID = "jfPeopleMount";

  const isRoute = () => {
    const h = window.location.hash || "";
    return h === HASH || h.startsWith(HASH + "?") || h.startsWith(HASH + "/");
  };

  function ensureOverlayMount() {
    let mount = document.getElementById(MOUNT_ID);
    if (!mount) {
      mount = document.createElement("div");
      mount.id = MOUNT_ID;
      (document.body || document.documentElement).appendChild(mount);
    } else if (mount.parentElement !== document.body && document.body) {
      document.body.appendChild(mount);
    }
    return mount;
  }

  function positionOverlay() {
    const mount = document.getElementById(MOUNT_ID);
    if (!mount) return;
    const header = document.querySelector("header");
    const top = header ? Math.max(0, Math.ceil(header.getBoundingClientRect().bottom)) : 0;
    const bottomNav = document.querySelector(".MuiBottomNavigation-root");
    const bottom = bottomNav
      ? Math.max(0, Math.ceil(window.innerHeight - bottomNav.getBoundingClientRect().top))
      : 0;
    mount.style.top = `${top}px`;
    mount.style.bottom = `${bottom}px`;
  }

  function setOverlayVisible(on) {
    const mount = ensureOverlayMount();
    if (on) {
      positionOverlay();
      mount.hidden = false;
    } else {
      mount.hidden = true;
    }
  }

  async function handleRoute() {
    if (!window.JFPeoplePage) return; // page script not ready yet
    try {
      updateFallback();
      const on = isRoute();
      setOverlayVisible(on);
      if (!on) {
        window.JFPeoplePage.unmount();
        return;
      }
      await window.JFPeoplePage.mount(ensureOverlayMount());
    } catch (e) { console.error("[PeopleRoute]", e); }
  }

  // Jellyfin renders #fallbackPage (unknown-route page) for custom hashes
  // like #/people. Hide it while our route is active, restore otherwise.
  function updateFallback() {
    const fallbackPage = document.getElementById("fallbackPage");
    if (!fallbackPage) {
      return;
    }
    fallbackPage.style.display = isRoute() ? "none" : "";
  }

  // Header "People" entry: clones the Favorites header link (same MUI
  // styling), relabels it, swaps in the people glyph, points at #/people.
  const PEOPLE_ICON_D =
    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-2.99 1.34-2.99 3S14.34 11 16 11zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.39 14.02 18 15.06 18 16.5V19h6v-2.5c0-2.33-5.67-3.5-8-3.5z";

  function addPeopleNav() {
    const stack = document.querySelector("header .MuiToolbar-root > .MuiStack-root");
    const favorite = [...stack?.querySelectorAll("a") || []]
      .find(a => a.textContent.trim() === "Favorites");

    if (!stack || !favorite) {
      return;
    }

    let people = stack.querySelector("[data-custom-people]");
    if (!people) {
      people = favorite.cloneNode(true);
      people.dataset.customPeople = "true";
      people.href = "#/people";

      [...people.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = "People";
        }
      });

      const path = people.querySelector("svg path");
      if (path) {
        path.setAttribute("d", PEOPLE_ICON_D);
      }

      stack.appendChild(people);
    }

    // Active state: Jellyfin can't mark an unknown route active itself.
    const on = isRoute();
    people.classList.toggle("Mui-selected", on);
    if (on) {
      people.setAttribute("aria-current", "page");
    } else {
      people.removeAttribute("aria-current");
    }
  }

  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("popstate", handleRoute);
  window.addEventListener("pageshow", handleRoute);
  window.addEventListener("resize", handleRoute);
  document.addEventListener("viewshow", handleRoute, true);

  // Jellyfin swaps views via DOM replacement, not always via hash events,
  // so sync on any DOM change (both mount missing AND stale visible root).
  // The same observer keeps the header People entry (and its active state)
  // alive across header re-renders.
  let syncTimer = null;
  const requestSync = () => {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      handleRoute();
      addPeopleNav();
    }, 50);
  };
  const observeTarget = document.body || document.documentElement;
  new MutationObserver(requestSync).observe(observeTarget, { childList: true, subtree: true });

  handleRoute();
  addPeopleNav();
})();
