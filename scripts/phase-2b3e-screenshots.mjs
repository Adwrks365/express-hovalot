import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b3e");
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { file: "storage-1440", path: "/אחסון-תכולה-לטווח-קצר/", w: 1440, h: 900 },
  { file: "storage-768", path: "/אחסון-תכולה-לטווח-קצר/", w: 768, h: 1024 },
  { file: "storage-390", path: "/אחסון-תכולה-לטווח-קצר/", w: 390, h: 844 },
  { file: "about-1440", path: "/about-us/", w: 1440, h: 900 },
  { file: "about-768", path: "/about-us/", w: 768, h: 1024 },
  { file: "about-390", path: "/about-us/", w: 390, h: 844 },
  { file: "article-1440", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", w: 1440, h: 900 },
  { file: "article-768", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", w: 768, h: 1024 },
  { file: "article-390", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", w: 390, h: 844 },
  { file: "faq-390", path: "/שאלות-נפוצות/", w: 390, h: 844 },
  { file: "contact-390", path: "/צרו-קשר/", w: 390, h: 844 },
  { file: "header-1440", path: "/", w: 1440, h: 900, header: true },
  { file: "header-390", path: "/", w: 390, h: 844, header: true },
];

const browser = await chromium.launch();
for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(`${BASE}${encodeURI(s.path)}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1000);
  const file = join(OUT, `${s.file}.png`);
  if (s.header) await page.getByRole("banner").screenshot({ path: file });
  else await page.screenshot({ path: file, fullPage: true });
  console.log("OK", file);
  await page.close();
}
await browser.close();
