/**
 * GA4 ページビュー送信（SPA 用）
 * gtag.js 本体は index.html で1回だけ読み込む。ここでは再注入しない。
 */
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let lastPageKey: string | null = null;

function currentPagePath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** 同一 path + title の連続送信を抑止（StrictMode / 二重発火対策） */
export function trackPageView(): void {
  if (typeof window.gtag !== "function") return;

  const pagePath = currentPagePath();
  const pageTitle = document.title;
  const pageKey = `${pagePath}\0${pageTitle}`;
  if (pageKey === lastPageKey) return;
  lastPageKey = pageKey;

  window.gtag("event", "page_view", {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
  });
}
