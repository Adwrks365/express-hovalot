/**
 * Phase 2B.4D — Rendered content coverage QA + fail-safe regression test
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import pages from "../src/content/data/pages.json" with { type: "json" };
import { sanitizeWordPressHtml, htmlToPlainText } from "../src/lib/wp-html.ts";
import { parsePageComposition } from "../src/lib/page-composition/parse-page-composition.ts";
import { countHeadings, countImages, normalizeVisibleText } from "../src/lib/page-composition/content-coverage.ts";
import { classifyPageArchetype } from "../src/lib/structured-pages/page-archetypes.ts";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
const SHOT = join(process.cwd(), "audit/screenshots/phase-2b4d");
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOT, { recursive: true });

const SAMPLES = [
  { slug: "moving-apartment", path: "/הובלת-דירה-בירושלים/", group: "SERVICE" },
  { slug: "office-moving", path: "/הובלות-משרדים-בירושלים/", group: "SERVICE" },
  { slug: "storage-short", path: "/אחסון-תכולה-לטווח-קצר/", group: "STORAGE" },
  { slug: "area-givat", path: "/הובלות-בגבעת-זאב/", group: "AREA" },
  { slug: "pricing", path: "/הצעת-מחיר/", group: "PRICING" },
  { slug: "about", path: "/about-us/", group: "ABOUT" },
  { slug: "contact", path: "/צרו-קשר/", group: "CONTACT" },
];

function pageRecord(path) {
  const normalized = path.replace(/\/$/, "") || "/";
  return pages.find((p) => {
    const pp = p.path?.startsWith("/") ? p.path : `/${p.slug}`;
    return pp === normalized || `/${p.slug}` === normalized;
  });
}

const browser = await chromium.launch();
const coverageRows = [];
const fails = [];

for (const sample of SAMPLES) {
  const record = pageRecord(sample.path);
  const sanitized = record
    ? sanitizeWordPressHtml(record.contentHtml, { stripDuplicateH1: true })
    : "";
  const archetype = record ? classifyPageArchetype(sample.path.replace(/\/$/, ""), "page") : "STANDARD_INFORMATION";
  const parsed = record ? parsePageComposition(sanitized, archetype) : null;

  const sourceTextLength = normalizeVisibleText(htmlToPlainText(sanitized)).length;
  const sourceHeadings = countHeadings(sanitized);
  const sourceImages = countImages(sanitized);

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(sample.path)}`, { waitUntil: "networkidle", timeout: 90000 });

  const dom = await page.evaluate(() => {
    const main = document.querySelector("main");
    const hero = main?.querySelector("[class*='InternalHero'], header + section, .internal-page > section:first-of-type");
    const finalConv = main?.querySelector("[data-final-conversion]");
    const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
    const finalTop = finalConv?.getBoundingClientRect().top ?? main?.getBoundingClientRect().bottom ?? 0;
    const bodyRegion = document.createElement("div");
    if (main) {
      const clone = main.cloneNode(true);
      clone.querySelector("[data-final-conversion]")?.remove();
      clone.querySelector("footer")?.remove();
      bodyRegion.innerHTML = clone.innerHTML;
    }
    const bodyText = bodyRegion.innerText?.replace(/\s+/g, " ").trim() || "";
    return {
      renderer: document.querySelector(".internal-page")?.getAttribute("data-renderer"),
      coverageRatio: document.querySelector(".internal-page")?.getAttribute("data-coverage-ratio"),
      blockCount: document.querySelector(".internal-page")?.getAttribute("data-structured-block-count"),
      bodyTextLength: bodyText.length,
      h2: main?.querySelectorAll("h2").length ?? 0,
      h3: main?.querySelectorAll("h3").length ?? 0,
      images: main?.querySelectorAll("img").length ?? 0,
      sections: main?.querySelectorAll("[data-section-type]").length ?? 0,
      richText: main?.querySelectorAll(".rich-text").length ?? 0,
      heroToFinalGap: finalTop - heroBottom,
      orphanForms: [...(main?.querySelectorAll("form") ?? [])].filter(
        (f) => !finalConv?.contains(f),
      ).length,
    };
  });

  await page.screenshot({ path: join(SHOT, `${sample.slug}-desktop.png`), fullPage: true });
  await page.close();

  const renderedTextLength = dom.bodyTextLength;
  const normalizedCoverage =
    sourceTextLength > 0 ? Math.min(1, renderedTextLength / sourceTextLength) : 1;

  const row = {
    url: sample.path,
    group: sample.group,
    sourceTextLength,
    renderedTextLength,
    parsedCoverageRatio: parsed?.coverageRatio ?? null,
    domCoverageRatio: dom.coverageRatio ? Number(dom.coverageRatio) : null,
    normalizedCoverage: Number(normalizedCoverage.toFixed(3)),
    sourceHeadings,
    renderedHeadings: { h2: dom.h2, h3: dom.h3 },
    sourceImages,
    renderedImages: dom.images,
    parsedBlockCount: parsed?.blocks.length ?? 0,
    parsedBlockTypes: parsed?.blocks.map((b) => b.type).join(",") ?? "",
    unclassifiedBlocks: parsed?.remainingContentBlocks.length ?? 0,
    removedDuplicates: parsed?.removedDuplicates.length ?? 0,
    renderer: dom.renderer,
    sections: dom.sections,
    richText: dom.richText,
    status: "PASS",
    screenshot: `audit/screenshots/phase-2b4d/${sample.slug}-desktop.png`,
  };

  const hasSubstantialSource = sourceHeadings.h2 >= 3 || sourceTextLength >= 1000;
  const thinBody =
    dom.sections < 2 && dom.richText < 2 && renderedTextLength < sourceTextLength * 0.5;

  if (hasSubstantialSource && thinBody) {
    row.status = "FAIL";
    fails.push(`${sample.slug}: thin body (${renderedTextLength}/${sourceTextLength} chars)`);
  } else if (sample.group !== "CONTACT" && normalizedCoverage < 0.5 && sourceTextLength > 500) {
    row.status = "FAIL";
    fails.push(`${sample.slug}: rendered coverage ${normalizedCoverage}`);
  } else if (dom.orphanForms > 0 && !["ABOUT", "CONTACT", "PRICING"].includes(sample.group)) {
    row.status = "FAIL";
    fails.push(`${sample.slug}: ${dom.orphanForms} orphan form(s)`);
  }

  coverageRows.push(row);
  console.log(row.status, sample.slug, "rendered:", renderedTextLength, "source:", sourceTextLength, "sections:", dom.sections);
}

await browser.close();

writeFileSync(join(OUT, "PHASE_2B4D_CONTENT_COVERAGE.json"), JSON.stringify({ generated: new Date().toISOString(), rows: coverageRows, fails }, null, 2));

if (fails.length) {
  console.error("\nFAILURES:", fails.join("\n"));
  process.exit(1);
}
console.log("\nAll", coverageRows.length, "samples PASS");
