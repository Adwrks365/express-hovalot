/**
 * Phase 2B.3G — Reference + header/dropdown screenshot gate
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b3g");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: "about", path: "/about-us/" },
  { slug: "faq", path: "/שאלות-נפוצות/" },
  { slug: "contact", path: "/צרו-קשר/" },
  { slug: "storage-short", path: "/אחסון-תכולה-לטווח-קצר/" },
  { slug: "storage-pallets", path: "/אחסון-משטחים/" },
  { slug: "moving", path: "/הובלת-דירה-בירושלים/" },
  { slug: "article", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/" },
];

const HEADER_WIDTHS = [1920, 1600, 1440, 1366, 1280];
const DROPDOWNS = [
  "שירותי הובלה",
  "אחסון תכולה",
  "הצעת מחיר",
  "טיפים ומידע",
  "הובלות באזור ירושלים",
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
    console.log("page", p.slug, suffix);
  }
}

for (const width of HEADER_WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `header-${width}.png`) });
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
  for (const label of DROPDOWNS) {
    const link = nav.getByRole("link", { name: label });
    if (await link.isVisible().catch(() => false)) {
      await link.hover();
      await page.waitForTimeout(600);
      const slug = label.replace(/\s+/g, "-");
      await page.screenshot({ path: join(OUT, `dropdown-${slug}.png`) });
    }
  }
  await page.close();
}

await browser.close();
