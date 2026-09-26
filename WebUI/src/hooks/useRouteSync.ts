import { useEffect, useState } from "react";
import {
  isPeopleRoute,
  setOverlayVisible,
  updateFallback,
} from "../routing.js";

/**
 * Owns #/people visibility. Jellyfin swaps views via DOM replacement (not
 * always via hash events), so a MutationObserver keeps this in sync.
 * Native pages are never touched — our overlay simply shows/hides.
 */
export function useRouteSync(): boolean {
  const [active, setActive] = useState<boolean>(isPeopleRoute());

  useEffect(() => {
    const handleRoute = (): void => {
      updateFallback();
      const on = isPeopleRoute();
      setOverlayVisible(on);
      setActive(on);
    };

    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("popstate", handleRoute);
    window.addEventListener("pageshow", handleRoute);
    window.addEventListener("resize", handleRoute);
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
      window.removeEventListener("resize", handleRoute);
      document.removeEventListener("viewshow", handleRoute, true);
      clearTimeout(t);
      ob.disconnect();
    };
  }, []);

  return active;
}
