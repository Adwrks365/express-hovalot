/**
 * Capture local full-page screenshots for Phase 2B.6 reference URLs.
 * Usage: node scripts/phase-2b6-reference-screenshots.mjs [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3010";
const VIEWPORT = { width: 1280, height: 720 };

const PATHS = [
  "/הובלת-דירה-בירושלים/",
  "/הובלות-משרדים-בירושלים/",
  "/אחסון-משטחים/",
  "/אחסון-תכולה-לטווח-קצר/",
  "/הובלות-בגבעת-זאב/",
  "/about-us/",
  "/שאלות-נפוצות/",
  "/צרו-קשר/",
  "/מעבר-דירה-בירושלים/",
  "/הצעת-מחיר/",
];

function slugFromPath(p) {
  return p.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home";
}

const outDir = path.join(process.cwd(), "audit/screenshots/phase-2b6-local");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });

for (const p of PATHS) {
  const url = `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
  const name = slugFromPath(p);
  console.log("Screenshot:", url);
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: true,
  });
}

await browser.close();
console.log("Done →", outDir);
