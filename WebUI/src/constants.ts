// Shared constants: DOM ids, route, paging, filter options.

export const HASH = "#/people";
export const MOUNT_ID = "jfPeopleMount";
export const ROOT_ID = "peoplePage";
export const GRID_ID = "jfPeopleGrid";
export const SEARCH_ID = "jfPeopleSearch";
export const STATUS_ID = "jfPeopleStatus";
export const PAGE_SIZE = 100;

export interface Filter {
  label: string;
  value: string;
}

export const FILTERS: Filter[] = [
  { label: "Everyone", value: "" },
  { label: "Actors", value: "Actor" },
  { label: "Directors", value: "Director" },
  { label: "Writers", value: "Writer" },
];

export const SORT_ORDERS: Filter[] = [
  { label: "Ascending", value: "Ascending" },
  { label: "Descending", value: "Descending" },
];

export const PEOPLE_ICON_D =
  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-2.99 1.34-2.99 3S14.34 11 16 11zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.39 14.02 18 15.06 18 16.5V19h6v-2.5c0-2.33-5.67-3.5-8-3.5z";
