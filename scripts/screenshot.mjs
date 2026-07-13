import { chromium } from "playwright";
import path from "node:path";

const url = process.argv[2] || "http://localhost:5173";
const outPath = process.argv[3] || "screenshot.png";
const waitMs = Number(process.argv[4] || 1500);
const width = Number(process.argv[5] || 1440);
const height = Number(process.argv[6] || 960);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(waitMs);
await page.screenshot({ path: path.resolve(outPath) });

console.log("=== console logs ===");
console.log(logs.join("\n") || "(none)");

await browser.close();
