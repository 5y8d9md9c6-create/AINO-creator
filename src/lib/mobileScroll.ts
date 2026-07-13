/** Shared mobile breakpoint for scroll behavior (matches CSS). */
export const MOBILE_SCROLL_MAX = 767;

export function isMobileScrollViewport() {
  return typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_SCROLL_MAX}px)`).matches;
}
