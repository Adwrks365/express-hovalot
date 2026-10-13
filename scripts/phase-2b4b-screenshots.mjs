/**
 * Phase 2B.4B — Service/Area reconstruction screenshot gate
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b4b");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: "moving-apartment", path: "/הובלת-דירה-בירושלים/" },
  { slug: "moving-small", path: "/הובלות-קטנות-בירושלים/" },
  { slug: "moving-office", path: "/הובלות-משרדים-בירושלים/" },
  { slug: "packing", path: "/חברת-אריזה-והובלה-בירושלים/" },
  { slug: "storage-short", path: "/אחסון-תכולה-לטווח-קצר/" },
  { slug: "special-crane", path: "/הובלות-מנוף-בירושלים/" },
  { slug: "area-region", path: "/הובלות-באזור-ירושלים/" },
  { slug: "area-givat-zeev", path: "/הובלות-בגבעת-זאב/" },
  { slug: "area-mevaseret", path: "/הובלות-במבשרת-ציון/" },
  { slug: "area-beit-shemesh", path: "/הובלות-בבית-שמש/" },
  { slug: "about", path: "/about-us/" },
  { slug: "faq", path: "/שאלות-נפוצות/" },
  { slug: "contact", path: "/צרו-קשר/" },
  { slug: "article", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/" },
];

const browser = await chromium.launch();
for (const p of PAGES) {
  for (const [vp, suffix] of [
    [{ width: 1440, height: 900 }, "desktop"],
    [{ width: 390, height: 844 }, "mobile"],
  ]) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    await page.screenshot({ path: join(OUT, `${p.slug}-${suffix}.png`), fullPage: true });
    await page.close();
    console.log(p.slug, suffix);
  }
}
await browser.close();
