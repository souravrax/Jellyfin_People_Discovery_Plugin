import { createRoot } from "react-dom/client";
import { App } from "./app.js";
import { addPeopleNav } from "./routing.js";
import { findHost } from "./routing.js";
import { MOUNT_ID } from "./constants.js";

/**
 * Entry point (esbuild → dist/people.bundle.js). Creates the mount node
 * under Jellyfin's content host, renders <App/>, and installs the header
 * nav entry (outside React — the header re-renders independently).
 */
export function bootstrap(): void {
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

  addPeopleNav();
  new MutationObserver(addPeopleNav).observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
}
