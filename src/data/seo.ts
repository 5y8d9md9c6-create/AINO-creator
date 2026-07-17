import { BRAND_EMAIL, INSTAGRAM_URL, SITE_URL } from "./site-config";
import { WORKS } from "./works";

/** 本番ドメイン（canonical / OGP / sitemap の基準URL） */
export { SITE_URL } from "./site-config";

export const SITE_NAME = "AINO creator";

export const SITE_TITLE =
  "AINO creator｜伝わるって、おもしろい。";

export const SITE_DESCRIPTION =
  "Web制作・LP・デザイン・アプリ開発。アイデアを、伝わるだけじゃない「おもしろい体験」に変えるAINO creatorの公式サイトです。";

export const SITE_KEYWORDS =
  "Web制作,LP制作,デザイン,バナー,フライヤー,アプリ開発,AINO creator,クリエイター,ポートフォリオ";

export const SITE_LOCALE = "ja_JP";

export const SITE_THEME_COLOR = "#863bff";

export const OG_IMAGE_PATH = "/og-image.png?v=2";
export const OG_IMAGE_ALT = "AINO creator — アイデアを、カタチにして、ワクワクに変える人。";

export const PERSON = {
  name: SITE_NAME,
  alternateName: "AINO",
  description: SITE_DESCRIPTION,
  email: BRAND_EMAIL,
  image: `${SITE_URL}/og-image.png`,
  jobTitle: "Webデザイナー / フロントエンドエンジニア",
  knowsAbout: [
    "Web制作",
    "LP制作",
    "グラフィックデザイン",
    "アプリ開発",
    "UI/UXデザイン",
  ],
  sameAs: [INSTAGRAM_URL],
} as const;

export const DEFAULT_CANONICAL = `${SITE_URL}/`;

export function workCanonicalUrl(workId: string): string {
  return `${SITE_URL}/works/${workId}`;
}

export function workSeoTitle(workTitle: string): string {
  return `${workTitle}｜${SITE_NAME}`;
}

export function workSeoDescription(overview: string): string {
  const trimmed = overview.length > 140 ? `${overview.slice(0, 137)}…` : overview;
  return `${trimmed} — ${SITE_NAME}の制作実績。`;
}

export const SITEMAP_PATHS = [
  "/",
  ...WORKS.map((work) => `/works/${work.id}`),
];

export const JSON_LD_PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PERSON.name,
  alternateName: PERSON.alternateName,
  description: PERSON.description,
  url: SITE_URL,
  image: PERSON.image,
  email: `mailto:${PERSON.email}`,
  jobTitle: PERSON.jobTitle,
  knowsAbout: PERSON.knowsAbout,
  sameAs: PERSON.sameAs,
} as const;
