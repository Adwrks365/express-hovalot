/**
 * Phase 2B.6B local screenshots for reference URLs.
 * Usage: node scripts/phase-2b6b-reference-screenshots.mjs [baseUrl]
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

const outDir = path.join(process.cwd(), "audit/screenshots/phase-2b6b-local");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });

for (const p of PATHS) {
  const url = `${BASE}${p}`;
  console.log(url);
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(900);
  const metrics = await page.evaluate(() => {
    const root = document.querySelector(".internal-page");
    return {
      designed: root?.getAttribute("data-designed-sections"),
      prose: root?.getAttribute("data-prose-sections"),
      rawHtml: root?.getAttribute("data-raw-html-blocks"),
      types: root?.getAttribute("data-semantic-block-types"),
    };
  });
  console.log("  metrics:", metrics);
  await page.screenshot({ path: path.join(outDir, `${slugFromPath(p)}.png`), fullPage: true });
}

await browser.close();
console.log("Done →", outDir);
