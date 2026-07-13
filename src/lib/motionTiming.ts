export function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
}

export function getFlightMs() {
  return isMobileViewport() ? 1000 : 2200;
}

export function getFlightSegments() {
  return isMobileViewport() ? 12 : 18;
}

export function getFlightScrollDelayMs() {
  return isMobileViewport() ? 0 : 280;
}

export function getEnvelopeToFormMs() {
  return isMobileViewport() ? 360 : 880;
}
