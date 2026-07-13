import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const targets = {
  A: { x: 215, y: 500 },
  I: { x: 400, y: 480 },
  N: { x: 555, y: 480 },
  O: { x: 790, y: 490 },
};

for (const [name, pos] of Object.entries(targets)) {
  await page.mouse.move(pos.x, pos.y);
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.screenshot({ path: `shots/interact-${name}-press.png` });
  await page.mouse.up();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `shots/interact-${name}-mid.png` });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `shots/interact-${name}-settle.png` });
}

console.log("=== logs ===");
console.log(logs.join("\n") || "(none)");
await browser.close();
