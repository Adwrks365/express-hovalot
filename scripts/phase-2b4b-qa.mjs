/**
 * Phase 2B.4B — Service/Area archetype + final conversion QA
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
mkdirSync(OUT, { recursive: true });

const archetypes = JSON.parse(
  readFileSync(join(process.cwd(), "src/content/data/page-archetypes.json"), "utf8"),
);

const COMMERCIAL = new Set(["SERVICE", "STORAGE_SERVICE", "AREA_PAGE", "PRICING"]);

const SAMPLE = [
  { slug: "moving-apartment", path: "/הובלת-דירה-בירושלים/" },
  { slug: "moving-small", path: "/הובלות-קטנות-בירושלים/" },
  { slug: "moving-office", path: "/הובלות-משרדים-בירושלים/" },
  { slug: "packing", path: "/חברת-אריזה-והובלה-בירושלים/" },
  { slug: "storage", path: "/אחסון-תכולה-לטווח-קצר/" },
  { slug: "special", path: "/הובלות-מנוף-בירושלים/" },
  { slug: "area-region", path: "/הובלות-באזור-ירושלים/" },
  { slug: "area-givat", path: "/הובלות-בגבעת-זאב/" },
  { slug: "area-mevaseret", path: "/הובלות-במבשרת-ציון/" },
  { slug: "area-beit-shemesh", path: "/הובלות-בבית-שמש/" },
  { slug: "area-maale", path: "/הובלות-במעלה-אדומים/" },
];

const browser = await chromium.launch();
const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.log("FAIL", name, e.message);
  }
}

for (const p of SAMPLE) {
  await test(`${p.slug}-final-conversion`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    const audit = await page.evaluate(() => {
      const root = document.querySelector(".internal-page");
      const final = root?.querySelector("[data-final-conversion]");
      const mainForms = root ? [...root.querySelectorAll("form")] : [];
      const orphan = mainForms.filter((f) => !final?.contains(f));
      return { final: final ? 1 : 0, orphan: orphan.length };
    });
    await page.close();
    if (audit.final !== 1) throw new Error(`expected 1 final conversion, got ${audit.final}`);
    if (audit.orphan > 0) throw new Error(`${audit.orphan} orphan form(s) in page body`);
  });

  await test(`${p.slug}-no-thin-column`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    const narrow = await page.evaluate(() => {
      const sections = [...document.querySelectorAll("main section, main [data-layout='container']")];
      let maxNarrow = 0;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        const ratio = r.width / document.documentElement.clientWidth;
        if (ratio > 0 && ratio < 0.55) maxNarrow++;
      }
      return maxNarrow;
    });
    await page.close();
    if (narrow > 3) throw new Error(`${narrow} sections under 55% width`);
  });
}

const commercialUrls = archetypes.entries.filter((e) => COMMERCIAL.has(e.archetype));
await test("commercial-archetype-count", async () => {
  if (commercialUrls.length < 25) throw new Error(`only ${commercialUrls.length} commercial URLs`);
});

await browser.close();

writeFileSync(
  join(OUT, "phase-2b4b-qa.json"),
  JSON.stringify({ generated: new Date().toISOString(), pass: results.every((r) => r.pass), results }, null, 2),
);
process.exit(results.every((r) => r.pass) ? 0 : 1);
