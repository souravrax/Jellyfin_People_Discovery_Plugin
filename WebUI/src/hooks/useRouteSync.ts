import { useEffect, useState } from "react";
import {
  findHost,
  hideNativePages,
  isPeopleRoute,
  showAllNativePages,
  updateFallback,
} from "../routing.js";
import { MOUNT_ID } from "../constants.js";

/**
 * Owns #/people visibility: mounts natives-hiding while the route is active,
 * restores everything when leaving. Jellyfin swaps views via DOM replacement
 * (not always via hash events), so a MutationObserver keeps this in sync.
 */
export function useRouteSync(): boolean {
  const [active, setActive] = useState<boolean>(isPeopleRoute());

  useEffect(() => {
    const handleRoute = (): void => {
      updateFallback();
      if (isPeopleRoute()) {
        const host = findHost();
        if (!host) {
          return;
        }
        hideNativePages(host);
        const mount = document.getElementById(MOUNT_ID);
        if (mount && mount.parentElement !== host) {
          host.appendChild(mount);
        }
        setActive(true);
      } else {
        setActive(false);
        showAllNativePages();
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

  return active;
}
