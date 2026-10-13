/**
 * Phase 2B.4C — Runtime renderer verification + DOM metrics
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
const SHOT = join(process.cwd(), "audit/screenshots/phase-2b4c");
const BEFORE = join(process.cwd(), "audit/screenshots/phase-2b4b");
const BEFORE_ALT = join(process.cwd(), "audit/screenshots/full-site-local");
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOT, { recursive: true });

const SAMPLES = [
  { path: "/הובלת-דירה-בירושלים/", slug: "moving-apartment", expected: "StructuredPageRenderer", archetype: "MOVING_SERVICE" },
  { path: "/הובלות-משרדים-בירושלים/", slug: "office-moving", expected: "ArchetypePageRenderer", archetype: "MOVING_SERVICE" },
  { path: "/חברת-אריזה-והובלה-בירושלים/", slug: "packing", expected: "ArchetypePageRenderer", archetype: "PACKING_SERVICE" },
  { path: "/אחסון-תכולה-לטווח-קצר/", slug: "storage-short", expected: "StructuredPageRenderer", archetype: "STORAGE_SERVICE" },
  { path: "/אחסון-משטחים/", slug: "storage-pallets", expected: "StructuredPageRenderer", archetype: "STORAGE_SERVICE" },
  { path: "/הובלות-באזור-ירושלים/", slug: "area-region", expected: "ArchetypePageRenderer", archetype: "AREA_PAGE" },
  { path: "/הובלות-בגבעת-זאב/", slug: "area-givat", expected: "ArchetypePageRenderer", archetype: "AREA_PAGE" },
  { path: "/הובלות-במבשרת-ציון/", slug: "area-mevaseret", expected: "ArchetypePageRenderer", archetype: "AREA_PAGE" },
  { path: "/הובלות-בבית-שמש/", slug: "area-beit-shemesh", expected: "ArchetypePageRenderer", archetype: "AREA_PAGE" },
  { path: "/הצעת-מחיר/", slug: "pricing", expected: "StructuredPageRenderer", archetype: "PRICING_PAGE" },
  { path: "/about-us/", slug: "about", expected: "StructuredPageRenderer", archetype: "ABOUT" },
  { path: "/צרו-קשר/", slug: "contact", expected: "StructuredPageRenderer", archetype: "CONTACT" },
];

function slugPath(path) {
  return path.replace(/^\//, "").replace(/\//g, "_") || "home";
}

const browser = await chromium.launch();
const rows = [];

for (const sample of SAMPLES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(sample.path)}`, { waitUntil: "networkidle", timeout: 90000 });

  const metrics = await page.evaluate(() => {
    const root = document.querySelector(".internal-page");
    const finalConv = root?.querySelectorAll("[data-final-conversion]").length || 0;
    const sectionTypes = root
      ? [...root.querySelectorAll("[data-section-type]")].map((el) => el.getAttribute("data-section-type"))
      : [];
    const grids = sectionTypes.filter((t) => t === "featureGrid" || t === "benefitGrid").length;
    const imageText = sectionTypes.filter((t) => t === "imageText").length;
    const prose = sectionTypes.filter((t) => t === "prose").length;
    const standaloneImgs = root
      ? [...root.querySelectorAll(".rich-text img")].filter((img) => {
          const w = img.getBoundingClientRect().width;
          return w > 80 && !img.closest("[data-section-type='imageText']");
        }).length
      : 0;
    const mainForms = root ? [...root.querySelectorAll("form")] : [];
    const finalEl = root?.querySelector("[data-final-conversion]");
    const orphanForms = mainForms.filter((f) => !finalEl?.contains(f)).length;
    const maxContentWidth = root
      ? Math.max(
          ...[...root.querySelectorAll(".rich-text, [data-section-type]")].map(
            (el) => el.getBoundingClientRect().width,
          ),
          0,
        )
      : 0;

    return {
      archetype: root?.getAttribute("data-page-archetype") || "MISSING",
      renderer: root?.getAttribute("data-renderer") || "MISSING",
      rawFallback: root?.getAttribute("data-raw-fallback") || "MISSING",
      blockCount: root?.getAttribute("data-structured-block-count") || "0",
      sectionTypes: sectionTypes.join(","),
      finalConv,
      grids,
      imageText,
      prose,
      standaloneImgs,
      orphanForms,
      maxContentWidth: Math.round(maxContentWidth),
    };
  });

  const status =
    metrics.renderer === "WordPressContent" && sample.expected !== "WordPressContent"
      ? "FAIL"
      : metrics.renderer === "MISSING"
        ? "FAIL"
        : metrics.renderer !== sample.expected && sample.expected !== "ArchetypePageRenderer"
          ? "MANUAL_REVIEW"
          : metrics.rawFallback === "true" && !sample.path.includes("הצעת-מחיר")
            ? "MANUAL_REVIEW"
            : "PASS";

  rows.push({
    url: sample.path,
    expectedArchetype: sample.archetype,
    expectedRenderer: sample.expected,
    ...metrics,
    screenshot: `audit/screenshots/phase-2b4c/${sample.slug}-desktop.png`,
    status,
  });

  await page.screenshot({ path: join(SHOT, `${sample.slug}-desktop.png`), fullPage: true });
  await page.screenshot({ path: join(SHOT, `${sample.slug}-mobile.png`), fullPage: true, clip: undefined });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: join(SHOT, `${sample.slug}-mobile.png`), fullPage: true });
  await page.close();
  console.log(sample.slug, metrics.renderer, status, "grids:", metrics.grids, "featureGrid+imgText:", metrics.grids + metrics.imageText);
}

await browser.close();

const md = [
  "# Phase 2B.4C — Runtime Renderer Map",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Base URL: ${BASE}`,
  "",
  "| URL | Expected | Actual Renderer | Raw Fallback | Blocks | Grids | ImageText | Final Conv | Orphan Forms | Status |",
  "|-----|----------|-----------------|--------------|--------|-------|-----------|------------|--------------|--------|",
  ...rows.map(
    (r) =>
      `| ${r.url} | ${r.expectedRenderer} | ${r.renderer} | ${r.rawFallback} | ${r.blockCount} | ${r.grids} | ${r.imageText} | ${r.finalConv} | ${r.orphanForms} | ${r.status} |`,
  ),
  "",
  "## Section types",
  "",
  ...rows.map((r) => `- **${r.url}**: ${r.sectionTypes || "(none)"}`),
].join("\n");

writeFileSync(join(OUT, "PHASE_2B4C_RUNTIME_RENDERER_MAP.md"), md);
writeFileSync(join(OUT, "phase-2b4c-runtime-map.json"), JSON.stringify({ generated: new Date().toISOString(), rows }, null, 2));

const failCount = rows.filter((r) => r.status === "FAIL").length;
process.exit(failCount > 0 ? 1 : 0);
