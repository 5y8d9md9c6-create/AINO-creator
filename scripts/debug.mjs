import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const logs = [];
page.on("console", (msg) => logs.push(msg.text()));
await page.addInitScript(() => { window.__debugLetter = true; });
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
console.log("total logs:", logs.length);
console.log(logs.join("\n"));
await browser.close();
