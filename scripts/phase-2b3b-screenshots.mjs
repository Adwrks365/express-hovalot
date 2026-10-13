import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PROD = "https://express-hovalot.co.il";
const LOCAL = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b3b");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: "storage-short", path: "/אחסון-תכולה-לטווח-קצר/" },
  { name: "contact", path: "/צרו-קשר/" },
  { name: "faq", path: "/שאלות-נפוצות/" },
  { name: "article-2026", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/" },
  { name: "quote", path: "/הצעת-מחיר/" },
];

const viewports = [
  { tag: "desktop-1440", width: 1440, height: 900 },
  { tag: "mobile-390", width: 390, height: 844 },
];

const browser = await chromium.launch();

for (const pageDef of PAGES) {
  for (const env of [
    { tag: "production", base: PROD },
    { tag: "local", base: LOCAL },
  ]) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const url = `${env.base}${encodeURI(pageDef.path)}`;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
        await page.waitForTimeout(1200);
        const file = join(OUT, `${pageDef.name}-${env.tag}-${vp.tag}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log("OK", file);
      } catch (e) {
        console.error("FAIL", url, e.message);
      } finally {
        await page.close();
      }
    }
  }
}

await browser.close();
