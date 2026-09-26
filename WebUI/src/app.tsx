// People browser — React + TypeScript UI with route handling in one bundle.
// Build: pnpm run build  (esbuild → dist/people.bundle.js, Tailwind → dist/people.bundle.css)
// The C# plugin embeds + injects both files into index.html.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  fetchPersons,
  personHref,
  personImageUrl,
  waitForApi,
  type PersonItem,
} from "./api.js";

const alreadyLoaded = Boolean(window.__JF_PEOPLE_BUNDLE__);
window.__JF_PEOPLE_BUNDLE__ = true;

const HASH = "#/people";
const MOUNT_ID = "jfPeopleMount";
const ROOT_ID = "peoplePage";
const GRID_ID = "jfPeopleGrid";
const SEARCH_ID = "jfPeopleSearch";
const STATUS_ID = "jfPeopleStatus";
const SENTINEL_ID = "jfPeopleSentinel";
const PAGE_SIZE = 100;

interface Filter {
  label: string;
  value: string;
}

const FILTERS: Filter[] = [
  { label: "People", value: "" },
  { label: "Actors", value: "Actor" },
  { label: "Directors", value: "Director" },
  { label: "Writers", value: "Writer" },
  { label: "Producers", value: "Producer" },
  { label: "Composers", value: "Composer" },
];

const SORT_ORDERS: Filter[] = [
  { label: "Ascending", value: "Ascending" },
  { label: "Descending", value: "Descending" },
];

const isPeopleRoute = (): boolean => {
  const h = window.location.hash || "";
  return h === HASH || h.startsWith(HASH + "?") || h.startsWith(HASH + "/");
};

const findHost = (): Element | null =>
  document.querySelector(".mainAnimatedPages") ||
  document.querySelector("main") ||
  document.querySelector("[role='main']");

// Jellyfin renders #fallbackPage (unknown-route page) for custom hashes
// like #/people. Hide it while our route is active, restore otherwise.
function updateFallback(): void {
  const fallbackPage = document.getElementById("fallbackPage");
  if (!fallbackPage) {
    return;
  }
  fallbackPage.style.display = isPeopleRoute() ? "none" : "";
}

const PEOPLE_ICON_D =
  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-2.99 1.34-2.99 3S14.34 11 16 11zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.39 14.02 18 15.06 18 16.5V19h6v-2.5c0-2.33-5.67-3.5-8-3.5z";

// Header "People" entry: clones the Favorites header link (same MUI
// styling), relabels it, swaps in the people glyph, points at #/people.
function addPeopleNav(): void {
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

function PersonCard({ person }: { person: PersonItem }) {
  const name = person.Name || "Unknown";
  const url = person.Id ? personImageUrl(person) : "";
  const initial = String(name).trim().charAt(0).toUpperCase() || "?";
  const href = person.Id ? personHref(person) : "#/people";
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="card portraitCard card-hoverable" data-id={person.Id || ""} data-type="Person">
      <div className="cardBox cardBox-bottompadded">
        <div className="cardScalable">
          <div className="cardPadder cardPadder-portrait"></div>
          <div className="cardContent">
            <div className="cardImageContainer coveredImage">
              {url && imgOk ? (
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  onError={() => setImgOk(false)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="cardImageIcon"
                  style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "3rem", opacity: 0.35,
                  }}
                >
                  {initial}
                </div>
              )}
            </div>
          </div>
          <div className="cardOverlayContainer itemAction MuiBox-root css-0" data-action="link">
            <a href={href} aria-label={name} className="cardImageContainer"></a>
          </div>
        </div>
        <div className="cardText cardTextCentered cardText-first MuiBox-root css-0">
          <a className="itemAction textActionButton" href={href} title={name}>
            {name}
          </a>
        </div>
        {person.PersonType ? (
          <div className="cardText cardTextCentered cardText-secondary MuiBox-root css-0">
            {person.PersonType}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState<boolean>(isPeopleRoute());
  const [input, setInput] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [personType, setPersonType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("Ascending");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [compact, setCompact] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [items, setItems] = useState<PersonItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [exhausted, setExhausted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const genRef = useRef<number>(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<boolean>(false);
  const exhaustedRef = useRef<boolean>(false);
  const filterRef = useRef({ query, personType, sortOrder, isFavorite });
  filterRef.current = { query, personType, sortOrder, isFavorite };
  loadingRef.current = loading;
  exhaustedRef.current = exhausted;

  // Debounce search input → query (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      const v = input.trim();
      setQuery((q) => (q === v ? q : v));
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  // Reset + load page 1 whenever filters change
  useEffect(() => {
    if (!active) {
      return;
    }
    const gen = ++genRef.current;
    setItems([]);
    setTotal(null);
    setExhausted(false);
    setError("");
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await waitForApi();
        if (cancelled || gen !== genRef.current) {
          return;
        }
        const f = filterRef.current;
        const res = await fetchPersons({
          startIndex: 0,
          limit: PAGE_SIZE,
          searchTerm: f.query,
          personType: f.personType,
          sortOrder: f.sortOrder,
          isFavorite: f.isFavorite,
        });
        if (cancelled || gen !== genRef.current) {
          return;
        }
        const list = Array.isArray(res?.Items) ? res.Items : [];
        if (typeof res?.TotalRecordCount === "number") {
          setTotal(res.TotalRecordCount);
        }
        setItems(list);
        const done =
          list.length < PAGE_SIZE ||
          (typeof res?.TotalRecordCount === "number" && list.length >= res.TotalRecordCount);
        setExhausted(done);
      } catch (e) {
        if (!cancelled && gen === genRef.current) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled && gen === genRef.current) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, query, personType, sortOrder, isFavorite]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhaustedRef.current) {
      return;
    }
    const gen = genRef.current;
    setLoading(true);
    setError("");
    try {
      const f = filterRef.current;
      const res = await fetchPersons({
        startIndex: items.length,
        limit: PAGE_SIZE,
        searchTerm: f.query,
        personType: f.personType,
        sortOrder: f.sortOrder,
        isFavorite: f.isFavorite,
      });
      if (gen !== genRef.current) {
        return;
      }
      const list = Array.isArray(res?.Items) ? res.Items : [];
      if (typeof res?.TotalRecordCount === "number") {
        setTotal(res.TotalRecordCount);
      }
      setItems((prev) => {
        const next = prev.concat(list);
        const done =
          list.length < PAGE_SIZE ||
          (typeof res?.TotalRecordCount === "number" && next.length >= res.TotalRecordCount);
        setExhausted(done);
        return next;
      });
    } catch (e) {
      if (gen === genRef.current) {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      if (gen === genRef.current) {
        setLoading(false);
      }
    }
  }, [items.length]);

  // Infinite scroll
  useEffect(() => {
    if (!active) {
      return;
    }
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const ob = new IntersectionObserver(
      (es) => {
        if (es[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "900px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [active, loadMore]);

  // Route handling: hide natives on #/people, restore everywhere else.
  useEffect(() => {
    const natives = (host: Element | null): Element[] =>
      !host
        ? []
        : [...host.children].filter(
            (n) => n.nodeType === 1 && (n as HTMLElement).id !== ROOT_ID && (n as HTMLElement).id !== MOUNT_ID
          );
    const hideNatives = (host: Element | null): void =>
      natives(host).forEach((n) => {
        const el = n as HTMLElement;
        if (!el.hasAttribute("data-jf-orig")) {
          el.setAttribute("data-jf-orig", el.style.display || "");
        }
        el.style.display = "none";
      });
    const showAllNatives = (): void =>
      document.querySelectorAll("[data-jf-orig]").forEach((n) => {
        const el = n as HTMLElement;
        el.style.display = el.getAttribute("data-jf-orig") || "";
        el.removeAttribute("data-jf-orig");
      });

    const handleRoute = (): void => {
      updateFallback();
      if (isPeopleRoute()) {
        const host = findHost();
        if (!host) {
          return;
        }
        hideNatives(host);
        const mount = document.getElementById(MOUNT_ID);
        if (mount && mount.parentElement !== host) {
          host.appendChild(mount);
        }
        setActive(true);
      } else {
        setActive(false);
        showAllNatives();
      }
    };

    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("popstate", handleRoute);
    window.addEventListener("pageshow", handleRoute);
    document.addEventListener("viewshow", handleRoute, true);
    let t: number | undefined;
    const sync = (): void => {
      clearTimeout(t);
      t = window.setTimeout(handleRoute, 50);
    };
    const ob = new MutationObserver(sync);
    ob.observe(document.documentElement, { childList: true, subtree: true });
    handleRoute();
    return () => {
      window.removeEventListener("hashchange", handleRoute);
      window.removeEventListener("popstate", handleRoute);
      window.removeEventListener("pageshow", handleRoute);
      document.removeEventListener("viewshow", handleRoute, true);
      clearTimeout(t);
      ob.disconnect();
    };
  }, []);

  // Close type menu on outside click
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const close = (e: MouseEvent): void => {
      if (!(e.target as HTMLElement).closest("[data-typemenu],[data-titlebtn]")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  if (!active) {
    return null;
  }

  const current = FILTERS.find((f) => f.value === personType) || FILTERS[0];
  const end = typeof total === "number" ? Math.min(items.length, total) : items.length;
  const range = typeof total === "number" ? `${total === 0 ? 0 : 1}-${end} of ${total}` : "…";
  const filterActive = Boolean(personType || query || isFavorite);

  const setType = (v: string): void => {
    setMenuOpen(false);
    setPersonType((p) => (p === v ? p : v));
  };
  const toggleSort = (): void => {
    setSortOrder((s) => (s === "Ascending" ? "Descending" : "Ascending"));
  };

  return (
    <div id={ROOT_ID} data-role="page" className="bg-ink font-sans text-[#f5f5f5] min-h-screen page mainAnimatedPage libraryPage pageWithAbsoluteTabs withTabs" data-backbutton="true">
      <div className="padded-bottom-page MuiBox-root css-0">
        <div className="sticky top-0 z-50 flex flex-wrap items-center gap-3.5 bg-[rgba(20,20,20,.96)] border-b border-white/10 px-4 py-2.5 MuiToolbar-root MuiToolbar-gutters MuiToolbar-dense padded-left padded-right css-133e01t" data-toolbar="">
          <button
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[1.55rem] font-extrabold tracking-wide text-white hover:bg-white/10 max-md:text-xl MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeLarge MuiButton-textSizeLarge MuiButton-colorInherit css-iqm7ky"
            type="button" aria-controls="jf-people-type-menu" aria-haspopup="true"
            data-titlebtn="" onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          >
            <span className="MuiTypography-root MuiTypography-h2 css-rtsren" data-titlelabel="">
              {current.value ? current.label : "People"}
            </span>
            <span className="MuiButton-icon MuiButton-endIcon MuiButton-iconSizeLarge css-19oo937">
              <svg className="h-6 w-6 fill-netflix MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowDropDownIcon">
                <path d="m7 10 5 5 5-5z"></path>
              </svg>
            </span>
          </button>
          <div className="MuiBox-root css-179zilw">
            <div className="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorDefault MuiChip-filledDefault css-1so75cn">
              <span className="inline-block whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#ddd] MuiChip-label MuiChip-labelMedium css-14vsv3w" data-range="">
                {range}
              </span>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3.5 MuiStack-root css-174l32b">
            <div role="group" className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5 MuiButtonGroup-root MuiButtonGroup-text MuiButtonGroup-horizontal MuiButtonGroup-colorInherit css-boo9v6">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#e8e8e8] hover:bg-white/10 hover:text-white MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-firstButton css-1f20jcn" type="button" title="Filter" data-act="filter" onClick={() => setFilterOpen((o) => !o)}>
                <span className="MuiBadge-root css-chz7cr">
                  <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FilterAltIcon">
                    <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61"></path>
                  </svg>
                  <span className={`ml-0.5 h-2 w-2 rounded-full bg-netflix MuiBadge-badge MuiBadge-dot MuiBadge-anchorOriginTopRight MuiBadge-overlapRectangular MuiBadge-colorInfo css-1umg760${filterActive ? "" : " MuiBadge-invisible"}`} data-filterdot=""></span>
                </span>
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#e8e8e8] hover:bg-white/10 hover:text-white MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-middleButton css-1f20jcn" type="button" title="Sort" data-act="sort" onClick={toggleSort}>
                <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SortByAlphaIcon">
                  <path d="M14.94 4.66h-4.72l2.36-2.36zm-4.69 14.71h4.66l-2.33 2.33zM6.1 6.27 1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27zm-1.13 7.37 1.94-5.18 1.94 5.18zm10.76 2.5h6.12v1.59h-8.53v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26z"></path>
                </svg>
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#e8e8e8] hover:bg-white/10 hover:text-white MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-lastButton css-1f20jcn" type="button" title="View settings" data-act="view" onClick={() => setCompact((c) => !c)}>
                <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ViewModuleIcon">
                  <path d="M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"></path>
                </svg>
              </button>
            </div>
            <div role="group" className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5 MuiButtonGroup-root MuiButtonGroup-text MuiButtonGroup-horizontal MuiButtonGroup-colorInherit css-boo9v6">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#e8e8e8] hover:bg-white/10 hover:text-white disabled:opacity-30 MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-firstButton css-1f20jcn"
                type="button" title="Previous" data-act="prev"
                disabled={items.length <= PAGE_SIZE}
                onClick={() => {
                  genRef.current++;
                  setItems([]); setTotal(null); setExhausted(false); setError("");
                }}
              >
                <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NavigateBeforeIcon">
                  <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                </svg>
              </button>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#e8e8e8] hover:bg-white/10 hover:text-white disabled:opacity-30 MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-lastButton css-1f20jcn"
                type="button" title="Next" data-act="next"
                disabled={exhausted}
                onClick={loadMore}
              >
                <svg className="h-[1.35rem] w-[1.35rem] fill-current MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NavigateNextIcon">
                  <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="absolute left-4 top-[calc(100%+.3rem)] z-[1300] min-w-52 rounded-xl border border-white/10 bg-[#1f1f1f] p-1.5 shadow-2xl MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation8 css-1l7bsgz" id="jf-people-type-menu" data-typemenu="" hidden={!menuOpen}>
            {FILTERS.map((f) => (
              <button key={f.label} type="button" role="menuitem" data-value={f.value} data-on={String(f.value === personType)} onClick={() => setType(f.value)}
                className="flex w-full rounded-md px-3 py-2.5 text-left text-sm text-[#eee] hover:bg-white/10 data-[on=true]:bg-netflix/20 data-[on=true]:font-bold">
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="libraryViewNav secondaryNav px-4 pt-1.5">
          <div className="libraryViewNavInner">
            <div className="emby-tabs">
              <div className="flex gap-1 overflow-x-auto pb-0.5 emby-tabs-slider" data-tabrow="">
                {FILTERS.map((f) => (
                  <button
                    key={f.label} type="button" data-value={f.value}
                    aria-selected={f.value === personType}
                    className={`whitespace-nowrap border-b-[3px] border-transparent px-3.5 py-2.5 text-sm font-semibold hover:text-white emby-tab-button${f.value === personType ? " !border-netflix !text-white" : " text-[#b3b3b3]"}`}
                    onClick={() => setType(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pt-1.5 jfPeopleHead" data-filterbar="" hidden={!filterOpen}>
          <div className="my-3 flex flex-wrap items-center gap-2.5 jfPeopleRow">
            <input
              id={SEARCH_ID} className="max-w-md grow basis-64 rounded-md border border-[#4d4d4d] bg-[#333] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-[#8c8c8c] focus:border-netflix focus:ring-2 focus:ring-netflix/35 emby-input" type="search"
              placeholder="Search people" autoComplete="off" aria-label="Search people"
              value={input} onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="my-3 flex flex-wrap items-center gap-2.5 jfPeopleRow jfFilterBar">
            <span className="flex items-center gap-2 jfFilterField">
              <label htmlFor="jfSortOrder" className="text-xs font-semibold text-[#b3b3b3]">Sort</label>
              <select id="jfSortOrder" className="min-w-36 cursor-pointer rounded-md border border-[#4d4d4d] bg-[#333] px-3 py-2 text-sm text-white emby-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                {SORT_ORDERS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </span>
            <span className="flex items-center gap-2 jfFilterField">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#ddd] checkboxContainer">
                <input type="checkbox" className="h-[1.1rem] w-[1.1rem] cursor-pointer accent-netflix emby-checkbox" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} />
                <span className="checkboxLabel">Favorites only</span>
              </label>
            </span>
          </div>
          <div className="my-3 flex flex-wrap items-center gap-2.5 jfPeopleRow jfTypeRow" role="group" aria-label="Person type">
            {FILTERS.map((f) => (
              <button
                key={f.label} type="button" data-value={f.value}
                aria-pressed={f.value === personType}
                className={`rounded-full px-4 py-2 text-xs font-bold active:scale-95 MuiButtonBase-root MuiToggleButton-root MuiToggleButton-sizeSmall MuiToggleButton-primary css-eee7z4${f.value === personType ? " border-netflix bg-netflix text-white" : " border-white/20 bg-white/10 text-[#e8e8e8] hover:bg-white/20 hover:text-white"}`}
                onClick={() => setType(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="itemsContainer padded-left padded-right vertical-wrap MuiBox-root css-0" id={GRID_ID}>
          {items.length === 0 && !loading && !error ? (
            <div className="noItemsMessage centerMessage MuiBox-root css-0">
              <h1 className="MuiTypography-root MuiTypography-h1">Nothing here.</h1>
              <p className="MuiTypography-root MuiTypography-body1">No people found.</p>
            </div>
          ) : (
            items.map((p) => <PersonCard key={`${p.Id}-${p.PersonType || ""}`} person={p} />)
          )}
        </div>
        <div id={STATUS_ID} className="px-4 py-10 text-center text-[#b3b3b3]">
          {loading ? "Loading…" : ""}
          {error ? (
            <>
              Failed to load: {error}{" "}
              <button
                className="mt-4 rounded-md bg-netflix px-6 py-2.5 font-bold text-white hover:bg-[#f6121d] emby-button" id="jfRetry" type="button"
                onClick={() => {
                  genRef.current++;
                  setItems([]); setTotal(null); setExhausted(false); setError("");
                }}
              >
                Retry
              </button>
            </>
          ) : null}
        </div>
        <div id={SENTINEL_ID} ref={sentinelRef} className="h-px w-full"></div>
      </div>
    </div>
  );
}

// Bootstrap: create the mount node under Jellyfin's content host and render.
function bootstrap(): void {
  const mountInto = (host: Element): void => {
    let mount = document.getElementById(MOUNT_ID);
    if (!mount) {
      mount = document.createElement("div");
      mount.id = MOUNT_ID;
      host.appendChild(mount);
      createRoot(mount).render(<App />);
    } else if (mount.parentElement !== host) {
      host.appendChild(mount);
    }
  };
  // Render as soon as a host exists so route handling is live immediately.
  const host = findHost();
  if (host) {
    mountInto(host);
  } else {
    const ob = new MutationObserver(() => {
      const h = findHost();
      if (h) {
        mountInto(h);
        ob.disconnect();
      }
    });
    ob.observe(document.documentElement, { childList: true, subtree: true });
  }
  window.JFPeoplePage = window.JFPeoplePage || {};
  // Expose the MOUNT id so any external route helper treats our node as ours.
  window.JFPeoplePage.rootId = MOUNT_ID;

  // Header nav entry lives outside React (header re-renders independently).
  addPeopleNav();
  new MutationObserver(addPeopleNav).observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
}

if (!alreadyLoaded) {
  try {
    bootstrap();
  } catch (e) {
    console.error("[People]", e);
  }
}
