import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:4173";
const errors = [];
const failedRequests = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
page.on("requestfailed", (req) => {
  failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
});

const response = await page.goto(base, { waitUntil: "networkidle", timeout: 30000 });
const status = response?.status() ?? 0;

await page.waitForTimeout(2000);

const assetChecks = await page.evaluate(async () => {
  const css = [...document.querySelectorAll('link[rel="stylesheet"]')].map((el) => ({
    href: el.href,
    ok: Boolean(el.sheet),
  }));
  const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src);
  const brand = document.querySelector(".footer-brand__art--base");
  const hero = document.querySelector(".hero-copy, .hero-title, #top");
  return {
    title: document.title,
    rootChildren: document.getElementById("root")?.childElementCount ?? 0,
    css,
    scripts,
    brandSrc: brand?.getAttribute("src") || null,
    brandComplete: brand?.complete ?? false,
    brandNatural: brand ? [brand.naturalWidth, brand.naturalHeight] : null,
    hasHero: Boolean(hero),
    fontsReady: document.fonts?.status ?? "unknown",
  };
});

// Scroll footer and test brand tap
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);

const footerBefore = await page.locator(".site-footer").isVisible();
let brandTapOk = false;
const brandBtn = page.locator(".footer-brand__tap");
if (await brandBtn.count()) {
  await brandBtn.click();
  await page.waitForTimeout(600);
  brandTapOk = await page.locator(".site-footer__spark, .footer-brand__art--lit").first().isVisible().catch(() => false);
  const litOpacity = await page.evaluate(() => {
    const lit = document.querySelector(".footer-brand__art--lit");
    if (!lit) return null;
    return getComputedStyle(lit).opacity;
  });
  brandTapOk = brandTapOk || Number(litOpacity) > 0.5;
}

await page.screenshot({ path: "shots/preview-mobile-footer.png", fullPage: false });

// Desktop pass
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`[desktop console] ${msg.text()}`);
});
desktop.on("pageerror", (err) => errors.push(`[desktop pageerror] ${err.message}`));
desktop.on("requestfailed", (req) => {
  failedRequests.push(`[desktop] ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
});
await desktop.goto(base, { waitUntil: "networkidle", timeout: 30000 });
await desktop.waitForTimeout(2500);
const ainoVisible = await desktop.locator(".aino-section, canvas").first().isVisible().catch(() => false);
await desktop.screenshot({ path: "shots/preview-desktop-hero.png" });

await browser.close();

console.log(JSON.stringify({
  base,
  status,
  assetChecks,
  footerBefore,
  brandTapOk,
  ainoVisible,
  failedRequests,
  errors,
}, null, 2));

if (status !== 200 || failedRequests.length || errors.length) process.exit(1);
