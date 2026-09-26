// ApiClient helpers — no manual auth, uses Jellyfin Web's active client.

export interface PersonItem {
  Id?: string;
  Name?: string;
  PersonType?: string;
  PrimaryImageTag?: string;
}

export interface PersonsResult {
  Items?: PersonItem[];
  TotalRecordCount?: number;
}

export interface PersonsQuery {
  startIndex: number;
  limit: number;
  searchTerm: string;
  personType: string;
  sortOrder: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getApi = (): any => window.ApiClient || null;

export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function waitForApi(timeoutMs = 15000): Promise<any> {
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

export async function fetchPersons(q: PersonsQuery): Promise<PersonsResult> {
  const a = await waitForApi();
  const params = {
    StartIndex: q.startIndex,
    Limit: q.limit,
    UserId: typeof a.getCurrentUserId === "function" ? a.getCurrentUserId() : undefined,
    SearchTerm: q.searchTerm || undefined,
    PersonTypes: q.personType || undefined,
    EnableImages: true,
    Fields: "PrimaryImageAspectRatio",
    SortBy: "SortName",
    SortOrder: q.sortOrder,
  };
  return a.getJSON(a.getUrl("Persons", params)) as Promise<PersonsResult>;
}

export function personImageUrl(person: PersonItem): string {
  try {
    const q: Record<string, string | number> = { fillHeight: 531, fillWidth: 354, quality: 96 };
    if (person.PrimaryImageTag) {
      q.tag = person.PrimaryImageTag;
    }
    return getApi().getUrl(`Items/${person.Id}/Images/Primary`, q) as string;
  } catch {
    return "";
  }
}

export function personHref(person: PersonItem): string {
  try {
    const a = getApi();
    const sid =
      (a && typeof a.getServerId === "function" && a.getServerId()) ||
      (a && typeof a.serverId === "function" && a.serverId()) ||
      (a && typeof a.serverId === "string" && a.serverId) ||
      "";
    const base = `#/details?id=${encodeURIComponent(person.Id ?? "")}`;
    return sid ? `${base}&serverId=${encodeURIComponent(sid)}` : base;
  } catch {
    return `#/details?id=${encodeURIComponent(person.Id ?? "")}`;
  }
}
