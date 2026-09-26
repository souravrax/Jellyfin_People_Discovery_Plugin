// Bundle entry. Guarded so a double load (plugin + injector) is a no-op.
import { bootstrap } from "./bootstrap.js";

const alreadyLoaded = Boolean(window.__JF_PEOPLE_BUNDLE__);
window.__JF_PEOPLE_BUNDLE__ = true;

if (!alreadyLoaded) {
  try {
    bootstrap();
  } catch (e) {
    console.error("[People]", e);
  }
}
