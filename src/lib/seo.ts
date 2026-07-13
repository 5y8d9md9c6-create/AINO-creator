import {
  DEFAULT_CANONICAL,
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  workCanonicalUrl,
  workSeoDescription,
  workSeoTitle,
} from "../data/seo";

type SeoOptions = {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
};

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"][data-seo-managed="true"]`,
  );
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.href = href;
}

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function applyDocumentSeo(options: SeoOptions = {}) {
  const title = options.title ?? SITE_TITLE;
  const description = options.description ?? SITE_DESCRIPTION;
  const canonical = options.canonical ?? DEFAULT_CANONICAL;
  const ogType = options.ogType ?? "website";
  const ogImage = absoluteUrl(options.ogImage ?? OG_IMAGE_PATH);
  const ogImageAlt = options.ogImageAlt ?? OG_IMAGE_ALT;

  document.title = title;

  upsertMeta("name", "description", description);
  upsertMeta("name", "keywords", SITE_KEYWORDS);
  upsertMeta(
    "name",
    "robots",
    options.noindex ? "noindex, nofollow" : "index, follow",
  );

  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", ogType);
  upsertMeta("property", "og:url", canonical);
  upsertMeta("property", "og:image", ogImage);
  upsertMeta("property", "og:image:alt", ogImageAlt);
  upsertMeta("property", "og:locale", SITE_LOCALE);

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", ogImage);
  upsertMeta("name", "twitter:image:alt", ogImageAlt);

  upsertLink("canonical", canonical);
}

export function applyHomeSeo() {
  applyDocumentSeo();
}

export function applyWorkSeo(work: {
  id: string;
  title: string;
  overview: string;
  thumbnail: string;
}) {
  applyDocumentSeo({
    title: workSeoTitle(work.title),
    description: workSeoDescription(work.overview),
    canonical: workCanonicalUrl(work.id),
    ogType: "article",
    ogImage: work.thumbnail,
    ogImageAlt: work.title,
  });
}
