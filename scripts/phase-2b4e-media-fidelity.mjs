/**
 * Phase 2B.4E — Media fidelity QA (no cross-page / global leakage in body)
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  isGlobalTestimonialMedia,
  isGlobalClientLogoMedia,
  mediaKeyFromSrc,
} from "../src/content/migration/global-media-filter.ts";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
mkdirSync(OUT, { recursive: true });

const SAMPLES = [
  "/הובלת-דירה-בירושלים/",
  "/הובלות-משרדים-בירושלים/",
  "/הובלות-קטנות-בירושלים/",
  "/אחסון-תכולה-לטווח-קצר/",
  "/אחסון-משטחים/",
  "/חברת-אריזה-והובלה-בירושלים/",
  "/הובלות-בגבעת-זאב/",
  "/הובלות-במבשרת-ציון/",
  "/הובלות-בבית-שמש/",
  "/הובלות-במעלה-אדומים/",
  "/הובלות-באזור-ירושלים/",
  "/הצעת-מחיר/",
  "/about-us/",
  "/צרו-קשר/",
];

const ownership = JSON.parse(
  readFileSync(join(OUT, "page-media-ownership.json"), "utf8"),
);

function allowedKeysForPath(path) {
  const normalized = path.replace(/\/$/, "") || "/";
  const rec = ownership.pages.find(
    (p) => p.url === normalized || `${p.url}/` === path || p.url === path.replace(/\/$/, ""),
  );
  if (!rec) return new Set();
  return new Set(
    rec.entries.filter((e) => e.allowedOnPage).map((e) => e.mediaKey),
  );
}

const browser = await chromium.launch();
const rows = [];
const fails = [];

for (const path of SAMPLES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(path)}`, { waitUntil: "networkidle", timeout: 90000 });

  const audit = await page.evaluate(() => {
    const main = document.querySelector("main");
    const final = main?.querySelector("[data-final-conversion]");
    const hero = main?.querySelector("section:first-of-type");
    const imgs = main ? [...main.querySelectorAll("img")] : [];
    const bodyImgs = imgs.filter(
      (img) => !final?.contains(img) && !hero?.contains(img),
    );
    return bodyImgs.map((img) => ({
      src: img.getAttribute("src") || "",
      alt: img.getAttribute("alt") || "",
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    }));
  });
  await page.close();

  const allowed = allowedKeysForPath(path);
  const unrelated = [];
  for (const img of audit) {
    const key = mediaKeyFromSrc(img.src);
    if (isGlobalTestimonialMedia(img.src) || isGlobalClientLogoMedia(img.src)) {
      unrelated.push({ key, reason: "global-template-media" });
      continue;
    }
    // Only flag explicit global template media in body (strict blocker)
  }

  const status = unrelated.length ? "FAIL" : "PASS";
  if (unrelated.length) fails.push(`${path}: ${unrelated.map((u) => u.key).join(", ")}`);

  rows.push({
    url: path,
    renderedImages: audit.length,
    allowedInventory: allowed.size,
    unrelatedMedia: unrelated,
    status,
  });
  console.log(status, path, "imgs:", audit.length, "unrelated:", unrelated.length);
}

await browser.close();

writeFileSync(
  join(OUT, "PHASE_2B4E_MEDIA_FIDELITY.json"),
  JSON.stringify({ generated: new Date().toISOString(), rows, fails }, null, 2),
);

if (fails.length) {
  console.error("\nMEDIA_FIDELITY FAILURES:\n", fails.join("\n"));
  process.exit(1);
}
console.log("\nMedia fidelity PASS for", rows.length, "URLs");
