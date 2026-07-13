import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const url = "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

console.log("Navigating to:", url);
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const shotDir = path.resolve("shots/scroll");
fs.mkdirSync(shotDir, { recursive: true });

await page.screenshot({ path: path.join(shotDir, "scroll-0.png") });

// Scroll down in increments
for (let i = 1; i <= 6; i++) {
  const scrollY = i * 400;
  console.log(`Scrolling to ${scrollY}...`);
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotDir, `scroll-${i}.png`) });
}

console.log("=== console logs ===");
console.log(logs.join("\n") || "(none)");

await browser.close();
