import { useEffect } from "react";
import { trackPageView } from "../lib/analytics";

/**
 * SPA のページ遷移を GA4 page_view として計測する。
 * - gtag 本体は index.html で1回のみ読み込み（ここでは注入しない）
 * - routeKey 変更時は SEO effect の直後に送る想定（App で宣言順を守る）
 * - hash のみの pushState は popstate + rAF で拾う
 */
export function usePageAnalytics(routeKey: string | null): void {
  useEffect(() => {
    trackPageView();
  }, [routeKey]);

  useEffect(() => {
    const onPopState = () => {
      requestAnimationFrame(() => trackPageView());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
