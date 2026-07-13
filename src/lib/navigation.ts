export function parseWorkRoute(pathname: string): string | null {
  const match = pathname.match(/^\/works\/([^/]+)\/?$/);
  return match?.[1] ?? null;
}

export function navigateToWork(workId: string) {
  window.history.pushState({ workId }, "", `/works/${workId}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

export function navigateToWorksIndex() {
  window.history.pushState({}, "", "/#works");
  window.dispatchEvent(new PopStateEvent("popstate"));
  requestAnimationFrame(() => {
    document.getElementById("works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
