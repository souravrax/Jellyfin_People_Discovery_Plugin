/**
 * Container inside our shadow root that Base UI portaled parts (Select
 * dropdown, …) render into — so nothing escapes to document.body.
 * Set once by bootstrap before first render; static afterwards.
 */
let portalContainer: HTMLElement | null = null;

export function setPortalContainer(el: HTMLElement | null): void {
  portalContainer = el;
}

export function getPortalContainer(): HTMLElement | null {
  return portalContainer;
}
