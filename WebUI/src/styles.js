// Self-contained Netflix-style CSS. Targets our own data-attributes/ids only —
// Jellyfin/MUI `css-*` hashes change per build, so we don't rely on them.
// Grid + portrait cards are Jellyfin-native and intentionally left alone.

export const ROOT_ID = "peoplePage";
export const GRID_ID = "jfPeopleGrid";
export const SEARCH_ID = "jfPeopleSearch";
export const STATUS_ID = "jfPeopleStatus";
export const SENTINEL_ID = "jfPeopleSentinel";

export const css = `
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
