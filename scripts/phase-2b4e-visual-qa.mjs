/**
 * Phase 2B.4E — Screenshots + section parity + content QA
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pages from "../src/content/data/pages.json" with { type: "json" };
import { sanitizeWordPressHtml } from "../src/lib/wp-html.ts";
import { parsePageComposition } from "../src/lib/page-composition/parse-page-composition.ts";
import { classifyPageArchetype } from "../src/lib/structured-pages/page-archetypes.ts";
import {
  isGlobalTestimonialMedia,
  isGlobalClientLogoMedia,
} from "../src/content/migration/global-media-filter.ts";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
const SHOT_LOCAL = join(process.cwd(), "audit/screenshots/phase-2b4e/local");
const SHOT_PROD = join(process.cwd(), "audit/screenshots/phase-2b4e/production");
const SHOT_PROD_SRC = join(process.cwd(), "audit/screenshots/full-site-production");
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOT_LOCAL, { recursive: true });
mkdirSync(SHOT_PROD, { recursive: true });

const SAMPLES = [
  { slug: "moving-apartment", path: "/הובלת-דירה-בירושלים/" },
  { slug: "office-moving", path: "/הובלות-משרדים-בירושלים/" },
  { slug: "moving-small", path: "/הובלות-קטנות-בירושלים/" },
  { slug: "storage-short", path: "/אחסון-תכולה-לטווח-קצר/" },
  { slug: "storage-pallets", path: "/אחסון-משטחים/" },
  { slug: "packing", path: "/חברת-אריזה-והובלה-בירושלים/" },
  { slug: "area-givat", path: "/הובלות-בגבעת-זאב/" },
  { slug: "area-mevaseret", path: "/הובלות-במבשרת-ציון/" },
  { slug: "area-beit-shemesh", path: "/הובלות-בבית-שמש/" },
  { slug: "area-maale", path: "/הובלות-במעלה-אדומים/" },
  { slug: "pricing", path: "/הצעת-מחיר/" },
  { slug: "about", path: "/about-us/" },
  { slug: "contact", path: "/צרו-קשר/" },
];

function pageRecord(path) {
  const n = path.replace(/\/$/, "");
  return pages.find((p) => {
    const pp = p.path?.startsWith("/") ? p.path : `/${p.slug}`;
    return pp === n;
  });
}

const browser = await chromium.launch();
const parity = [];
const comparison = [];
let totalUnrelatedMedia = 0;

for (const sample of SAMPLES) {
  let pageUnrelated = 0;
  const record = pageRecord(sample.path);
  const sanitized = record
    ? sanitizeWordPressHtml(record.contentHtml, { stripDuplicateH1: true })
    : "";
  const archetype = record
    ? classifyPageArchetype(sample.path.replace(/\/$/, ""), "page")
    : "STANDARD_INFORMATION";
  const parsed = record ? parsePageComposition(sanitized, archetype) : null;

  const prodName = sample.path.replace(/^\//, "").replace(/\//g, "_") + "-desktop.png";
  const prodSrc = join(SHOT_PROD_SRC, prodName);
  if (existsSync(prodSrc)) {
    copyFileSync(prodSrc, join(SHOT_PROD, `${sample.slug}-desktop.png`));
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(sample.path)}`, { waitUntil: "networkidle", timeout: 90000 });

  const dom = await page.evaluate(() => {
    const main = document.querySelector("main");
    const final = main?.querySelector("[data-final-conversion]");
    const hero = main?.querySelector("section:first-of-type");
    const imgs = [...(main?.querySelectorAll("img") ?? [])].filter(
      (img) => !final?.contains(img) && !hero?.contains(img),
    );
    return {
      bodyText: main?.innerText?.replace(/\s+/g, " ").trim().length || 0,
      h2: main?.querySelectorAll("h2").length || 0,
      sections: main?.querySelectorAll("[data-section-type]").length || 0,
      richText: main?.querySelectorAll(".rich-text").length || 0,
      imgs: imgs.map((i) => i.getAttribute("src") || ""),
      coverage: document.querySelector(".internal-page")?.getAttribute("data-coverage-ratio"),
    };
  });

  await page.screenshot({
    path: join(SHOT_LOCAL, `${sample.slug}-desktop.png`),
    fullPage: true,
  });
  await page.close();

  for (const src of dom.imgs) {
    if (isGlobalTestimonialMedia(src) || isGlobalClientLogoMedia(src)) pageUnrelated++;
  }
  totalUnrelatedMedia += pageUnrelated;

  const classification =
    pageUnrelated > 0 && sample.path.includes("הובלות-ב")
      ? "FAIL_SOURCE_FIDELITY"
      : dom.bodyText < 800 && sanitized.length > 5000
        ? "FAIL_SOURCE_FIDELITY"
        : dom.sections >= 2 || dom.richText >= 3
          ? "NEEDS_POLISH"
          : "APPROVED";

  parity.push({
    url: sample.path,
    productionSections: (sanitized.match(/<h2/gi) || []).length,
    localBlockTypes: parsed?.blocks.map((b) => b.type).join(",") || "curated",
    orderMatch: "partial",
    mediaMatch: pageUnrelated === 0 ? "PASS" : "FAIL",
    coverageRatio: parsed?.coverageRatio ?? dom.coverage,
    status: classification === "FAIL_SOURCE_FIDELITY" ? "FAIL" : "PASS",
  });

  comparison.push({
    url: sample.path,
    slug: sample.slug,
    productionScreenshot: existsSync(prodSrc)
      ? `audit/screenshots/phase-2b4e/production/${sample.slug}-desktop.png`
      : null,
    localScreenshot: `audit/screenshots/phase-2b4e/local/${sample.slug}-desktop.png`,
    bodyTextLength: dom.bodyText,
    sections: dom.sections,
    classification,
  });

  console.log(sample.slug, classification, "text:", dom.bodyText, "sections:", dom.sections);
}

await browser.close();

writeFileSync(join(OUT, "PHASE_2B4E_SECTION_PARITY.json"), JSON.stringify({ generated: new Date().toISOString(), parity }, null, 2));

const md = [
  "# Phase 2B.4E — Visual Comparison",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| Page | Classification | Body text | Sections | Production | Local |",
  "|------|----------------|----------:|---------:|------------|-------|",
  ...comparison.map(
    (c) =>
      `| ${c.url} | ${c.classification} | ${c.bodyTextLength} | ${c.sections} | ${c.productionScreenshot ? "✓" : "—"} | ${c.localScreenshot} |`,
  ),
  "",
  "## Unrelated portrait/logo media in body",
  "",
  `Count: **${totalUnrelatedMedia}** (target: 0)`,
].join("\n");

writeFileSync(join(OUT, "PHASE_2B4E_VISUAL_COMPARISON.md"), md);
console.log("\nUnrelated global media in body:", totalUnrelatedMedia);
