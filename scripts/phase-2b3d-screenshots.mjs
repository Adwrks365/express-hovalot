import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b3d-revised");
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { file: "about-desktop", path: "/about-us/", w: 1440, h: 900, full: true },
  { file: "about-mobile", path: "/about-us/", w: 390, h: 844, full: true },
  { file: "faq-desktop", path: "/שאלות-נפוצות/", w: 1440, h: 900, full: true },
  { file: "faq-mobile", path: "/שאלות-נפוצות/", w: 390, h: 844, full: true },
  { file: "storage-desktop", path: "/אחסון-תכולה-לטווח-קצר/", w: 1440, h: 900, full: true },
  { file: "storage-mobile", path: "/אחסון-תכולה-לטווח-קצר/", w: 390, h: 844, full: true },
  { file: "article-desktop", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", w: 1440, h: 900, full: true },
  { file: "article-mobile", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", w: 390, h: 844, full: true },
  { file: "contact-desktop", path: "/צרו-קשר/", w: 1440, h: 900, full: true },
  { file: "header-1440", path: "/", w: 1440, h: 900, header: true },
  { file: "header-1366", path: "/", w: 1366, h: 900, header: true },
  { file: "header-1280", path: "/", w: 1280, h: 900, header: true },
  { file: "header-mobile", path: "/", w: 390, h: 844, header: true },
  { file: "dropdown-open", path: "/", w: 1536, h: 900, header: true, dropdown: true },
];

const browser = await chromium.launch();
for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(`${BASE}${encodeURI(s.path)}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(s.dropdown ? 800 : 1200);
  if (s.dropdown) {
    await page.getByRole("navigation", { name: "ניווט ראשי" }).getByRole("link", { name: /טיפים ומידע/ }).hover();
    await page.waitForTimeout(400);
  }
  const file = join(OUT, `${s.file}.png`);
  if (s.header) await page.getByRole("banner").screenshot({ path: file });
  else if (s.full) await page.screenshot({ path: file, fullPage: true });
  else await page.screenshot({ path: file });
  console.log("OK", file);
  await page.close();
}
await browser.close();
