import { createRoot } from "react-dom/client";
import { App } from "./app.js";
import { addPeopleNav, ensureOverlayMount } from "./routing.js";
import { MOUNT_ID } from "./constants.js";

/**
 * Entry point (esbuild → dist/people.bundle.js). Renders <App/> into our
 * body-level overlay mount and installs the header nav entry (outside
 * React — the header re-renders independently).
 */
export function bootstrap(): void {
  const mount = ensureOverlayMount();
  if (!mount.hasAttribute("data-jf-root")) {
    mount.setAttribute("data-jf-root", "true");
    createRoot(mount).render(<App />);
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
