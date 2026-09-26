// ApiClient helpers — no manual auth, uses Jellyfin Web's active client.

export const getApi = () => window.ApiClient || null;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function waitForApi(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const a = getApi();
    if (a && typeof a.getUrl === "function") {
      return a;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }
  throw new Error("ApiClient not ready");
}

export async function fetchPersons({ startIndex, limit, searchTerm, personType, sortOrder, isFavorite }) {
  const a = await waitForApi();
  const params = {
    StartIndex: startIndex,
    Limit: limit,
    UserId: typeof a.getCurrentUserId === "function" ? a.getCurrentUserId() : undefined,
    SearchTerm: searchTerm || undefined,
    PersonTypes: personType || undefined,
    EnableImages: true,
    Fields: "PrimaryImageAspectRatio",
    SortBy: "SortName",
    SortOrder: sortOrder,
    IsFavorite: isFavorite ? true : undefined,
  };
  return a.getJSON(a.getUrl("Persons", params));
}

export function personImageUrl(person) {
  try {
    const q = { fillHeight: 531, fillWidth: 354, quality: 96 };
    if (person.PrimaryImageTag) {
      q.tag = person.PrimaryImageTag;
    }
    return getApi().getUrl(`Items/${person.Id}/Images/Primary`, q);
  } catch {
    return "";
  }
}

export function personHref(person) {
  try {
    const a = getApi();
    const sid =
      (a && typeof a.getServerId === "function" && a.getServerId()) ||
      (a && typeof a.serverId === "function" && a.serverId()) ||
      (a && typeof a.serverId === "string" && a.serverId) ||
      "";
    const base = `#/details?id=${encodeURIComponent(person.Id)}`;
    return sid ? `${base}&serverId=${encodeURIComponent(sid)}` : base;
  } catch {
    return `#/details?id=${encodeURIComponent(person.Id)}`;
  }
}
