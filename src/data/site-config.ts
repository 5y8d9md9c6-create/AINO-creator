/**
 * 本番切替用の仮情報・将来変更値の一元管理
 * ─────────────────────────────────────────
 * ドメイン取得・メール作成・Instagram開設後は、このファイルを先に更新し、
 * 下記 MANUAL_SYNC_FILES も同じ値に揃えてから `npm run build` してください。
 */
export const SITE_CONFIG = {
  /** 本番サイトURL（末尾スラッシュなし） */
  siteUrl: "https://aino-creator.jp",

  /** ブラウザアドレスバー表示用（PlanセクションのモックUI） */
  siteDisplayHost: "aino-creator.jp",

  /**
   * お問い合わせフォーム mailto 送信先
   * ContactSection → buildMailto()
   */
  contactEmail: "hello@aino-creator.com",

  /**
   * Footer Mail リンク・JSON-LD email
   * footer.ts / seo.ts
   */
  brandEmail: "hello@ainocreator.jp",

  /** Instagram プロフィールURL（開設後に差し替え） */
  instagramUrl: "https://www.instagram.com/",
} as const;

/**
 * ビルド時に自動反映されないファイル。
 * SITE_CONFIG 更新後、手動で同じ値に揃えること。
 */
export const MANUAL_SYNC_FILES = [
  "index.html", // canonical, OGP, JSON-LD
  "public/robots.txt", // Sitemap URL
  "public/sitemap.xml", // 全 <loc>
] as const;

/** @deprecated 互換用。新規参照は SITE_CONFIG を直接使用 */
export const SITE_URL = SITE_CONFIG.siteUrl;
export const SITE_DISPLAY_HOST = SITE_CONFIG.siteDisplayHost;
export const CONTACT_EMAIL = SITE_CONFIG.contactEmail;
export const BRAND_EMAIL = SITE_CONFIG.brandEmail;
export const INSTAGRAM_URL = SITE_CONFIG.instagramUrl;
