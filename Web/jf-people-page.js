// jf-people-page.js - must load BEFORE route script
// Ownership: UI + API only. No routing, no nav.
// Native look: mimics #moviesPage (page + alphaPicker + itemsContainer + portraitCard).
(() => {
  "use strict";
  if (window.JFPeoplePage) return;

  const ROOT_ID = "peoplePage";
  const GRID_ID = "jfPeopleGrid";
  const SEARCH_ID = "jfPeopleSearch";
  const STATUS_ID = "jfPeopleStatus";
  const SENTINEL_ID = "jfPeopleSentinel";
  const STYLE_ID = "jfPeopleNativeStyle";

  const PAGE_SIZE = 100;
  const FILTERS = [
    { label: "All", value: "" },
    { label: "Actors", value: "Actor" },
    { label: "Directors", value: "Director" },
    { label: "Writers", value: "Writer" },
    { label: "Producers", value: "Producer" },
    { label: "Composers", value: "Composer" },
  ];
  const SORT_ORDERS = [
    { label: "Ascending", value: "Ascending" },
    { label: "Descending", value: "Descending" },
  ];

  const state = {
    mounted: false, searchTerm: "", personType: "",
    sortOrder: "Ascending", isFavorite: false, compact: false,
    startIndex: 0, total: null, loading: false,
    exhausted: false, generation: 0, observer: null,
    searchTimer: null, items: [],
  };

  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

  const api = () => window.ApiClient || null;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitForApi() {
    for (let i = 0; i < 150; i++) {
      const a = api();
      if (a && typeof a.getUrl === "function") return a;
      await sleep(100);
    }
    throw new Error("ApiClient not ready");
  }

  async function fetchPeople(startIndex, limit) {
    const a = await waitForApi();
    const params = {
      StartIndex: startIndex, Limit: limit,
      UserId: a.getCurrentUserId?.() || undefined,
      SearchTerm: state.searchTerm || undefined,
      PersonTypes: state.personType || undefined,
      EnableImages: true,
      Fields: "PrimaryImageAspectRatio",
      SortBy: "SortName", SortOrder: state.sortOrder,
      IsFavorite: state.isFavorite ? true : undefined,
    };
    return a.getJSON(a.getUrl("Persons", params));
  }

  function imgUrl(person) {
    try {
      const q = { fillHeight: 531, fillWidth: 354, quality: 96 };
      if (person.PrimaryImageTag) q.tag = person.PrimaryImageTag;
      return api().getUrl(`Items/${person.Id}/Images/Primary`, q);
    } catch { return ""; }
  }

  function detailsHref(person) {
    try {
      const a = api();
      const sid = (a && typeof a.getServerId === "function" && a.getServerId())
        || (a && typeof a.serverId === "function" && a.serverId())
        || (a && typeof a.serverId === "string" && a.serverId)
        || "";
      const base = `#/details?id=${encodeURIComponent(person.Id)}`;
      return sid ? `${base}&serverId=${encodeURIComponent(sid)}` : base;
    } catch { return `#/details?id=${encodeURIComponent(person.Id)}`; }
  }

  // Self-contained Netflix-style CSS. Targets our own data-attributes only —
  // Jellyfin/MUI `css-*` hashes change per build, so we don't rely on them.
  // Grid + portrait cards are Jellyfin-native and intentionally left alone.
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      #jfPeopleMount{position:fixed;left:0;right:0;z-index:1000;background:#141414;overflow-y:auto;overscroll-behavior:contain}
      #jfPeopleMount[hidden]{display:none!important}
      #${ROOT_ID}{background:#141414;color:#f5f5f5;min-height:100vh;font-family:Inter,Netflix Sans,Helvetica Neue,Arial,sans-serif}
      #${ROOT_ID} [data-toolbar]{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:.9rem;flex-wrap:wrap;
        padding:.7rem 1.1rem;background:rgba(20,20,20,.96);border-bottom:1px solid rgba(255,255,255,.08)}
      #${ROOT_ID} [data-titlebtn]{display:flex;align-items:center;gap:.35rem;background:transparent;border:0;cursor:pointer;
        color:#fff;font-size:1.55rem;font-weight:800;letter-spacing:.01em;padding:.25rem .4rem;border-radius:.35rem}
      #${ROOT_ID} [data-titlebtn]:hover{background:rgba(255,255,255,.08)}
      #${ROOT_ID} [data-titlebtn] svg{width:1.6rem;height:1.6rem;fill:#e50914}
      #${ROOT_ID} [data-range]{display:inline-block;background:rgba(255,255,255,.12);color:#ddd;font-size:.8rem;font-weight:600;
        padding:.3rem .8rem;border-radius:999px;white-space:nowrap}
      #${ROOT_ID} .MuiStack-root{display:flex !important;align-items:center;gap:.9rem;margin-left:auto;flex-wrap:wrap}
      #${ROOT_ID} [role="group"]{display:flex !important;align-items:center;gap:.15rem;background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.1);border-radius:.5rem;padding:.15rem}
      #${ROOT_ID} [data-act]{display:inline-flex !important;align-items:center;justify-content:center;width:2.4rem;height:2.4rem;
        background:transparent !important;border:0 !important;border-radius:.4rem !important;cursor:pointer;color:#e8e8e8 !important;
        opacity:1 !important;min-width:0 !important;padding:0 !important;margin:0 !important;box-shadow:none !important}
      #${ROOT_ID} [data-act]:hover{background:rgba(255,255,255,.14) !important;color:#fff !important}
      #${ROOT_ID} [data-act].Mui-disabled{opacity:.28 !important;cursor:default !important}
      #${ROOT_ID} [data-act] svg{width:1.35rem;height:1.35rem;fill:currentColor}
      #${ROOT_ID} [data-filterdot]{width:.5rem;height:.5rem;border-radius:50%;background:#e50914;margin-left:.15rem}
      #${ROOT_ID} [data-typemenu]{position:absolute;top:calc(100% + .3rem);left:1rem;z-index:1300;min-width:13rem;padding:.4rem;background:#1f1f1f !important;
        border:1px solid rgba(255,255,255,.12);border-radius:.6rem;box-shadow:0 1rem 2.5rem rgba(0,0,0,.6)}
      #${ROOT_ID} [data-typemenu][hidden],#${ROOT_ID} [data-filterbar][hidden]{display:none !important}
      #${ROOT_ID} [data-typemenu] button{display:flex;width:100%;text-align:left;background:transparent;border:0;color:#eee;
        font:inherit;font-size:.95rem;padding:.6rem .8rem;border-radius:.35rem;cursor:pointer}
      #${ROOT_ID} [data-typemenu] button:hover{background:rgba(255,255,255,.1)}
      #${ROOT_ID} [data-typemenu] button[data-on="true"]{background:rgba(229,9,20,.22);color:#fff;font-weight:700}
      #${ROOT_ID} .libraryViewNav{padding:.4rem 1.1rem 0}
      #${ROOT_ID} [data-tabrow]{display:flex;gap:.25rem;overflow-x:auto;padding-bottom:.1rem}
      #${ROOT_ID} [data-tabrow] button{background:transparent;border:0;color:#b3b3b3;font:inherit;font-size:.95rem;font-weight:600;
        padding:.65rem .9rem;cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap}
      #${ROOT_ID} [data-tabrow] button:hover{color:#fff}
      #${ROOT_ID} [data-tabrow] button.emby-tab-button-active{color:#fff !important;border-bottom-color:#e50914 !important}
      #${ROOT_ID} .jfPeopleHead{padding:.4rem 1.1rem 0}
      #${ROOT_ID} .jfPeopleRow{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin:.8rem 0}
      #${SEARCH_ID}{flex:1 1 16rem;max-width:26rem;background:#333 !important;color:#fff !important;border:1px solid #4d4d4d !important;
        border-radius:.35rem !important;padding:.65rem .9rem !important;font-size:.95rem !important;outline:none}
      #${SEARCH_ID}::placeholder{color:#8c8c8c}
      #${SEARCH_ID}:focus{border-color:#e50914 !important;box-shadow:0 0 0 2px rgba(229,9,20,.35)}
      #${ROOT_ID} .jfFilterField{display:flex;align-items:center;gap:.45rem}
      #${ROOT_ID} .jfFilterField label{color:#b3b3b3;font-size:.85rem;font-weight:600}
      #${ROOT_ID} .jfFilterField select{background:#333 !important;color:#fff !important;border:1px solid #4d4d4d !important;
        border-radius:.35rem !important;padding:.55rem .7rem !important;font-size:.9rem;min-width:9rem;cursor:pointer}
      #${ROOT_ID} .checkboxContainer{display:flex;align-items:center;gap:.5rem;cursor:pointer;color:#ddd;font-size:.9rem}
      #${ROOT_ID} .emby-checkbox{width:1.1rem;height:1.1rem;accent-color:#e50914;cursor:pointer}
      #${ROOT_ID} .jfTypeRow button{background:rgba(255,255,255,.1) !important;border:1px solid rgba(255,255,255,.14) !important;
        color:#e8e8e8 !important;border-radius:999px !important;padding:.5rem 1.05rem !important;font-size:.88rem !important;
        font-weight:700 !important;cursor:pointer}
      #${ROOT_ID} .jfTypeRow button:hover{background:rgba(255,255,255,.18) !important;color:#fff !important}
      #${ROOT_ID} .jfTypeRow button:active{transform:scale(.96)}
      #${ROOT_ID} .jfTypeRow button.Mui-selected{background:#e50914 !important;border-color:#e50914 !important;color:#fff !important}
      #${STATUS_ID}{padding:2.5rem 1rem;text-align:center;color:#b3b3b3;font-size:1rem}
      #${STATUS_ID} #jfRetry{margin-top:1rem;background:#e50914;border:0;color:#fff;font-weight:700;border-radius:.35rem;
        padding:.65rem 1.4rem;cursor:pointer;font-size:.95rem}
      #${STATUS_ID} #jfRetry:hover{background:#f6121d}
      #${SENTINEL_ID}{width:100%;height:1px}
      #${ROOT_ID}.jfCompact #${GRID_ID}{--jf-card-min:105px}
      #${GRID_ID}{--jf-card-min:145px}
      @media(max-width:700px){
        #${ROOT_ID} [data-titlebtn]{font-size:1.2rem}
        #${ROOT_ID} [data-toolbar]{gap:.55rem;padding:.6rem .8rem}
        #${ROOT_ID} .libraryViewNav,#${ROOT_ID} .jfPeopleHead{padding-left:.8rem;padding-right:.8rem}
        #${GRID_ID}{--jf-card-min:105px}
      }`;
    document.head.appendChild(s);
  }

  function createPage() {
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("data-role", "page");
    root.className = "page mainAnimatedPage libraryPage pageWithAbsoluteTabs withTabs";
    root.setAttribute("data-backbutton", "true");

    root.innerHTML = `
      <div class="padded-bottom-page MuiBox-root css-0">
        <div class="MuiToolbar-root MuiToolbar-gutters MuiToolbar-dense padded-left padded-right css-133e01t" data-toolbar>
          <button class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeLarge MuiButton-textSizeLarge MuiButton-colorInherit css-iqm7ky" tabindex="0" type="button" aria-controls="jf-people-type-menu" aria-haspopup="true" data-titlebtn>
            <span class="MuiTypography-root MuiTypography-h2 css-rtsren" data-titlelabel>People</span>
            <span class="MuiButton-icon MuiButton-endIcon MuiButton-iconSizeLarge css-19oo937"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowDropDownIcon"><path d="m7 10 5 5 5-5z"></path></svg></span>
          </button>
          <div class="MuiBox-root css-179zilw"><div class="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorDefault MuiChip-filledDefault css-1so75cn"><span class="MuiChip-label MuiChip-labelMedium css-14vsv3w" data-range>…</span></div></div>
          <div class="MuiStack-root css-174l32b">
            <div role="group" class="MuiButtonGroup-root MuiButtonGroup-text MuiButtonGroup-horizontal MuiButtonGroup-colorInherit css-boo9v6">
              <button class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-grouped MuiButtonGroup-groupedHorizontal MuiButtonGroup-groupedText MuiButtonGroup-groupedTextHorizontal MuiButtonGroup-groupedTextInherit MuiButtonGroup-firstButton css-1f20jcn" tabindex="0" type="button" title="Filter" data-act="filter"><span class="MuiBadge-root css-chz7cr"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FilterAltIcon"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61"></path></svg><span class="MuiBadge-badge MuiBadge-dot MuiBadge-invisible MuiBadge-anchorOriginTopRight MuiBadge-anchorOriginTopRightRectangular MuiBadge-overlapRectangular MuiBadge-colorInfo css-1umg760" data-filterdot></span></span></button>
              <button class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-grouped MuiButtonGroup-groupedHorizontal MuiButtonGroup-groupedText MuiButtonGroup-groupedTextHorizontal MuiButtonGroup-groupedTextInherit MuiButtonGroup-middleButton css-1f20jcn" tabindex="0" type="button" title="Sort" data-act="sort"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SortByAlphaIcon"><path d="M14.94 4.66h-4.72l2.36-2.36zm-4.69 14.71h4.66l-2.33 2.33zM6.1 6.27 1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27zm-1.13 7.37 1.94-5.18 1.94 5.18zm10.76 2.5h6.12v1.59h-8.53v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26z"></path></svg></button>
              <button class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-grouped MuiButtonGroup-groupedHorizontal MuiButtonGroup-groupedText MuiButtonGroup-groupedTextHorizontal MuiButtonGroup-groupedTextInherit MuiButtonGroup-lastButton css-1f20jcn" tabindex="0" type="button" title="View settings" data-act="view"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ViewModuleIcon"><path d="M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"></path></svg></button>
            </div>
            <div role="group" class="MuiButtonGroup-root MuiButtonGroup-text MuiButtonGroup-horizontal MuiButtonGroup-colorInherit css-boo9v6">
              <button class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-grouped MuiButtonGroup-groupedHorizontal MuiButtonGroup-groupedText MuiButtonGroup-groupedTextHorizontal MuiButtonGroup-groupedTextInherit MuiButtonGroup-firstButton css-1f20jcn" tabindex="0" type="button" title="Previous" data-act="prev"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NavigateBeforeIcon"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button>
              <button class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButtonGroup-grouped MuiButtonGroup-groupedHorizontal MuiButtonGroup-groupedText MuiButtonGroup-groupedTextHorizontal MuiButtonGroup-groupedTextInherit MuiButtonGroup-lastButton css-1f20jcn" tabindex="0" type="button" title="Next" data-act="next"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NavigateNextIcon"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></button>
            </div>
          </div>
          <div class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation8 css-1l7bsgz" id="jf-people-type-menu" data-typemenu hidden></div>
        </div>
        <div class="libraryViewNav secondaryNav">
          <div class="libraryViewNavInner">
            <div class="emby-tabs">
              <div class="emby-tabs-slider" data-tabrow></div>
            </div>
          </div>
        </div>
        <div class="jfPeopleHead" data-filterbar>
          <div class="jfPeopleRow">
            <input id="${SEARCH_ID}" class="emby-input" type="search"
              placeholder="Search people" autocomplete="off" aria-label="Search people"/>
          </div>
          <div class="jfPeopleRow jfFilterBar">
            <span class="jfFilterField">
              <label for="jfSortOrder">Sort</label>
              <select id="jfSortOrder" class="emby-select" data-sort></select>
            </span>
            <span class="jfFilterField">
              <label class="checkboxContainer">
                <input type="checkbox" class="emby-checkbox" data-fav/>
                <span class="checkboxLabel">Favorites only</span>
              </label>
            </span>
          </div>
          <div class="jfPeopleRow jfTypeRow" role="group" aria-label="Person type"></div>
        </div>
        <div class="itemsContainer padded-left padded-right vertical-wrap MuiBox-root css-0" id="${GRID_ID}"></div>
        <div id="${STATUS_ID}"></div>
        <div id="${SENTINEL_ID}"></div>
      </div>`;

    // Person-type filter in THREE synced places (toolbar title menu + library tabs + toggle row)
    const tabRow = root.querySelector("[data-tabrow]");
    const typeRow = root.querySelector(".jfTypeRow");
    const typeMenu = root.querySelector("[data-typemenu]");
    const titleLabel = root.querySelector("[data-titlelabel]");
    const titleBtn = root.querySelector("[data-titlebtn]");
    const syncTypeUI = () => {
      const current = FILTERS.find(f => f.value === state.personType) || FILTERS[0];
      titleLabel.textContent = current.value ? `${current.label}` : "People";
      tabRow.querySelectorAll("button").forEach(x => {
        const on = x.dataset.value === state.personType;
        x.classList.toggle("emby-tab-button-active", on);
        x.setAttribute("aria-selected", String(on));
      });
      typeRow.querySelectorAll("button").forEach(x => {
        const on = x.dataset.value === state.personType;
        x.setAttribute("aria-pressed", String(on));
        x.classList.toggle("Mui-selected", on);
      });
      typeMenu.querySelectorAll("button").forEach(x => {
        x.dataset.on = String(x.dataset.value === state.personType);
      });
    };
    const setType = (v) => {
      typeMenu.hidden = true;
      if (state.personType === v) return;
      state.personType = v;
      syncTypeUI();
      resetAndLoad();
    };
    titleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      typeMenu.hidden = !typeMenu.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!typeMenu.hidden && !typeMenu.contains(e.target) && e.target !== titleBtn && !titleBtn.contains(e.target)) {
        typeMenu.hidden = true;
      }
    });
    FILTERS.forEach((f, i) => {
      const m = document.createElement("button");
      m.type = "button";
      m.textContent = f.label;
      m.dataset.value = f.value;
      m.dataset.on = String(i === 0);
      m.setAttribute("role", "menuitem");
      m.addEventListener("click", () => setType(f.value));
      typeMenu.appendChild(m);

      const t = document.createElement("button");
      t.type = "button";
      t.className = "emby-tab-button" + (i === 0 ? " emby-tab-button-active" : "");
      t.textContent = f.label;
      t.dataset.value = f.value;
      t.setAttribute("aria-selected", String(i === 0));
      t.addEventListener("click", () => setType(f.value));
      tabRow.appendChild(t);

      const b = document.createElement("button");
      b.type = "button";
      b.className = "MuiButtonBase-root MuiToggleButton-root MuiToggleButton-sizeSmall MuiToggleButton-primary css-eee7z4"
        + (i === 0 ? " Mui-selected" : "");
      b.textContent = f.label;
      b.dataset.value = f.value;
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => setType(f.value));
      typeRow.appendChild(b);
    });

    // Sort order (native select) — mirrors Movies sort control
    const sortSel = root.querySelector("[data-sort]");
    SORT_ORDERS.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === state.sortOrder) opt.selected = true;
      sortSel.appendChild(opt);
    });
    sortSel.addEventListener("change", (e) => {
      state.sortOrder = e.target.value;
      resetAndLoad();
    });

    // Favorites-only (native checkbox) — uses Persons isFavorite param
    const favBox = root.querySelector("[data-fav]");
    favBox.checked = state.isFavorite;
    favBox.addEventListener("change", (e) => {
      state.isFavorite = e.target.checked;
      resetAndLoad();
    });

    const input = root.querySelector(`#${SEARCH_ID}`);
    input.addEventListener("input", (e) => {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => {
        const v = e.target.value.trim();
        if (v === state.searchTerm) return;
        state.searchTerm = v;
        resetAndLoad();
      }, 300);
    });

    // Toolbar actions (same groups as Movies toolbar; no Play/Shuffle — people aren't playable)
    const filterBar = root.querySelector("[data-filterbar]");
    const setBtnDisabled = (act, disabled) => {
      const b = root.querySelector(`[data-act="${act}"]`);
      if (!b) return;
      b.classList.toggle("Mui-disabled", disabled);
      if (disabled) b.setAttribute("disabled", "");
      else b.removeAttribute("disabled");
      b.tabIndex = disabled ? -1 : 0;
    };
    root.querySelector('[data-act="filter"]').addEventListener("click", () => {
      filterBar.hidden = !filterBar.hidden;
    });
    root.querySelector('[data-act="sort"]').addEventListener("click", () => {
      state.sortOrder = state.sortOrder === "Ascending" ? "Descending" : "Ascending";
      const sel = root.querySelector("[data-sort]");
      if (sel) sel.value = state.sortOrder;
      resetAndLoad();
    });
    root.querySelector('[data-act="view"]').addEventListener("click", () => {
      state.compact = !state.compact;
      document.getElementById(ROOT_ID)?.classList.toggle("jfCompact", state.compact);
    });
    root.querySelector('[data-act="prev"]').addEventListener("click", () => {
      // Infinite model: go back to first page
      if (state.startIndex > PAGE_SIZE && !state.loading) resetAndLoad();
    });
    root.querySelector('[data-act="next"]').addEventListener("click", () => {
      if (!state.exhausted && !state.loading) loadMore();
    });
    root._jfSetNav = setBtnDisabled;

    return root;
  }

  // Native portraitCard for a Person (link-based, like moviesPage cards).
  function card(p) {
    const name = p.Name || "Unknown";
    const url = p.Id ? imgUrl(p) : "";
    const initial = String(name).trim().charAt(0).toUpperCase() || "?";
    const href = p.Id ? detailsHref(p) : "#/people";
    const el = document.createElement("div");
    el.className = "card portraitCard card-hoverable";
    el.setAttribute("data-id", p.Id || "");
    el.setAttribute("data-type", "Person");
    el.innerHTML = `
      <div class="cardBox cardBox-bottompadded">
        <div class="cardScalable">
          <div class="cardPadder cardPadder-portrait"></div>
          <div class="cardContent">
            <div class="cardImageContainer coveredImage">
              ${url ? `<img src="${esc(url)}" alt="" loading="lazy"
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>`
              : `<div class="cardImageIcon" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:.35">${esc(initial)}</div>`}
            </div>
          </div>
          <div class="cardOverlayContainer itemAction MuiBox-root css-0" data-action="link">
            <a href="${esc(href)}" aria-label="${esc(name)}" class="cardImageContainer"></a>
          </div>
        </div>
        <div class="cardText cardTextCentered cardText-first MuiBox-root css-0">
          <a class="itemAction textActionButton" href="${esc(href)}" title="${esc(name)}">${esc(name)}</a>
        </div>
        ${p.PersonType ? `<div class="cardText cardTextCentered cardText-secondary MuiBox-root css-0">${esc(p.PersonType)}</div>` : ""}
      </div>`;
    const img = el.querySelector("img");
    img?.addEventListener("error", () => {
      img.outerHTML = `<div class="cardImageIcon" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:.35">${esc(initial)}</div>`;
    }, { once: true });
    return el;
  }

  function setStatus(html) {
    const n = document.getElementById(STATUS_ID);
    if (n) n.innerHTML = html || "";
  }

  function updateCount() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    // Range chip like Movies ("1-100 of 390")
    const range = root.querySelector("[data-range]");
    if (range) {
      if (typeof state.total === "number") {
        const end = Math.min(state.startIndex, state.total);
        const start = state.total === 0 ? 0 : 1;
        range.textContent = `${start}-${end} of ${state.total}`;
      } else {
        range.textContent = "…";
      }
    }
    // Filter dot: visible only when a filter/search/fav is active
    const dot = root.querySelector("[data-filterdot]");
    if (dot) {
      const active = Boolean(state.personType || state.searchTerm || state.isFavorite);
      dot.classList.toggle("MuiBadge-invisible", !active);
    }
    if (typeof root._jfSetNav === "function") {
      root._jfSetNav("prev", state.startIndex <= PAGE_SIZE);
      root._jfSetNav("next", state.exhausted);
    }
  }

  async function resetAndLoad() {
    state.generation++;
    state.startIndex = 0; state.total = null;
    state.exhausted = false; state.items = [];
    const g = document.getElementById(GRID_ID);
    if (g) g.innerHTML = "";
    updateCount();
    await loadMore();
  }

  async function loadMore() {
    if (state.loading || state.exhausted || !state.mounted) return;
    state.loading = true;
    const gen = state.generation;
    setStatus("Loading…");
    try {
      const res = await fetchPeople(state.startIndex, PAGE_SIZE);
      if (gen !== state.generation) return;
      const items = Array.isArray(res?.Items) ? res.Items : [];
      if (typeof res?.TotalRecordCount === "number") state.total = res.TotalRecordCount;
      const grid = document.getElementById(GRID_ID);
      if (!items.length && state.startIndex === 0) {
        if (grid) grid.innerHTML = `<div class="noItemsMessage centerMessage MuiBox-root css-0"><h1 class="MuiTypography-root MuiTypography-h1">Nothing here.</h1><p class="MuiTypography-root MuiTypography-body1">No people found.</p></div>`;
        state.exhausted = true;
      } else {
        state.items.push(...items);
        const frag = document.createDocumentFragment();
        items.forEach(p => frag.appendChild(card(p)));
        grid?.appendChild(frag);
        state.startIndex += items.length;
        if (items.length < PAGE_SIZE) state.exhausted = true;
        if (typeof state.total === "number" && state.startIndex >= state.total) state.exhausted = true;
      }
      updateCount();
      setStatus("");
    } catch (e) {
      if (gen !== state.generation) return;
      console.error("[People]", e);
      setStatus(`Failed to load: ${esc(e.message)} <button class="emby-button" id="jfRetry">Retry</button>`);
      document.getElementById("jfRetry")?.addEventListener("click", resetAndLoad);
    } finally { state.loading = false; }
  }

  function setupInfinite() {
    state.observer?.disconnect();
    const s = document.getElementById(SENTINEL_ID);
    if (!s) return;
    state.observer = new IntersectionObserver((es) => {
      if (es[0]?.isIntersecting) loadMore();
    }, { rootMargin: "900px 0px" });
    state.observer.observe(s);
  }

  async function mount(host) {
    injectStyles();
    await waitForApi();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = createPage();
      host.appendChild(root);
    }
    root.style.display = "";
    state.mounted = true;
    setupInfinite();
    if (!state.items.length && !state.loading) resetAndLoad();
  }

  function unmount() {
    state.mounted = false;
    state.observer?.disconnect();
    document.getElementById(ROOT_ID)?.style.setProperty("display", "none");
  }

  window.JFPeoplePage = { mount, unmount, resetAndLoad, rootId: ROOT_ID };
})();
