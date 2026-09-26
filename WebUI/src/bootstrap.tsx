import { createRoot } from "react-dom/client";
import { App } from "./app.js";
import { addPeopleNav } from "./routing.js";
import { setPortalContainer } from "./portal.js";
import { MOUNT_ID } from "./constants.js";
import cssText from "./__generated.css";

const MOUNT_STYLE_ID = "jfPeopleMountStyle";

/**
 * Entry point (esbuild → dist/people.bundle.js, CSS inlined as text).
 *
 * Our UI lives in an OPEN SHADOW ROOT under #jfPeopleMount: our <style> and
 * markup are inside, so our styles cannot leak out to Jellyfin — and since
 * Base UI portals render into a container inside the same root, nothing
 * escapes there either. (Style leak-IN via inheritance is accepted and
 * harmless: our tokens are all set explicitly.)
 *
 * The ONLY global footprint is a tiny <style> for the mount shell itself
 * (positioning + hidden), targeting our own id — it cannot match anything
 * of Jellyfin's.
 */
export function bootstrap(): void {
  if (!document.getElementById(MOUNT_STYLE_ID)) {
    const host = document.createElement("style");
    host.id = MOUNT_STYLE_ID;
    host.textContent = [
      `#${MOUNT_ID}{position:fixed;left:0;right:0;z-index:1000;overflow-y:auto;overscroll-behavior:contain;background:#0b0b0d}`,
      `#${MOUNT_ID}[hidden]{display:none!important}`,
    ].join("\n");
    document.head.appendChild(host);
  }

  let mount = document.getElementById(MOUNT_ID);
  if (!mount) {
    mount = document.createElement("div");
    mount.id = MOUNT_ID;
    (document.body || document.documentElement).appendChild(mount);
  }

  if (!mount.shadowRoot) {
    const shadow = mount.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = cssText;
    shadow.appendChild(style);
    const appHost = document.createElement("div");
    appHost.id = "jfShadowApp";
    shadow.appendChild(appHost);
    const portalHost = document.createElement("div");
    portalHost.id = "jfShadowPortals";
    shadow.appendChild(portalHost);
    setPortalContainer(portalHost);
    createRoot(appHost).render(<App />);
  } else if (mount.parentElement !== document.body && document.body) {
    document.body.appendChild(mount);
  }

  window.JFPeoplePage = window.JFPeoplePage || {};
  // Expose the MOUNT id so any external route helper treats our node as ours.
  window.JFPeoplePage.rootId = MOUNT_ID;

  addPeopleNav();
  new MutationObserver(addPeopleNav).observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
}
