import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://localhost:3100";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0) continue;
    if (r.right > vw + 2 || r.left < -2) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        text: (el.textContent || "").trim().slice(0, 40),
        className: (el.className || "").toString().slice(0, 100),
        right: Math.round(r.right),
        left: Math.round(r.left),
        width: Math.round(r.width),
      });
    }
  }
  return { vw, sw, overflow: sw - vw, offenders: offenders.sort((a, b) => b.right - a.right).slice(0, 8) };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
