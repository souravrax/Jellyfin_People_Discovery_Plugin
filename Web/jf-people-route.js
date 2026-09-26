// jf-people-route.js - requires jf-people-page.js loaded first
// Ownership: #/people routing only. No UI, no API.
(() => {
  "use strict";
  if (window.__JF_PEOPLE_ROUTE__) return;
  window.__JF_PEOPLE_ROUTE__ = true;

  const HASH = "#/people"; // change to "#/peoples" if you want that URL
  const isRoute = () => {
    const h = window.location.hash || "";
    return h === HASH || h.startsWith(HASH + "?") || h.startsWith(HASH + "/");
  };

  const findHost = () => document.querySelector(".mainAnimatedPages")
    || document.querySelector("main") || document.querySelector("[role='main']");

  const natives = (host) => !host ? [] : [...host.children].filter(
    n => n.nodeType === 1 && n.id !== window.JFPeoplePage?.rootId);

  const hideNatives = (host) => natives(host).forEach(n => {
    if (!n.hasAttribute("data-jf-orig")) n.setAttribute("data-jf-orig", n.style.display || "");
    n.style.display = "none";
  });

  const showNatives = (host) => natives(host).forEach(n => {
    if (n.hasAttribute("data-jf-orig")) {
      n.style.display = n.getAttribute("data-jf-orig") || "";
      n.removeAttribute("data-jf-orig");
    }
  });

  const showAllNatives = () => document.querySelectorAll("[data-jf-orig]").forEach(n => {
    n.style.display = n.getAttribute("data-jf-orig") || "";
    n.removeAttribute("data-jf-orig");
  });

  async function handleRoute() {
    if (!window.JFPeoplePage) return; // page script not ready yet
    try {
      updateFallback();
      // Always hide first when leaving #/people, even if host is missing.
      // Jellyfin in-app navigation doesn't reliably fire hashchange alone.
      if (!isRoute()) {
        window.JFPeoplePage.unmount();
        showAllNatives();
        const host = findHost();
        if (host) showNatives(host);
        return;
      }
      const host = findHost();
      if (!host) return;
      hideNatives(host);
      await window.JFPeoplePage.mount(host);
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
