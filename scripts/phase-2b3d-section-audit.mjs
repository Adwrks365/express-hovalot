/**
 * Semantic section deduplication audit for reference pages.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const OUT_JSON = join(ROOT, "audit/reports/phase-2b3d-section-deduplication.json");
const OUT_MD = join(ROOT, "audit/reports/PHASE_2B3D_SECTION_DEDUPLICATION.md");

const REFERENCE = [
  { path: "/about-us", file: "about-us.json", productionSections: 8 },
  { path: "/שאלות-נפוצות", file: "שאלות-נפוצות.json", productionSections: 2 },
  { path: "/אחסון-תכולה-לטווח-קצר", file: "אחסון-תכולה-לטווח-קצר.json", productionSections: 7 },
  { path: "/צרו-קשר", file: "צרו-קשר.json", productionSections: 1 },
  {
    path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
    file: null,
    productionSections: 1,
    article: true,
  },
];

function hash(text) {
  return createHash("sha1").update(text || "").digest("hex").slice(0, 12);
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function describeBlock(block) {
  switch (block.type) {
    case "faq":
      return { heading: stripHtml(block.introHtml).slice(0, 80), textHash: hash(faqKey(block.items)) };
    case "featureGrid":
    case "storageSolutionsGrid":
      return {
        heading: block.title || stripHtml(block.introHtml).slice(0, 80),
        textHash: hash(block.cards.map((c) => c.title).join("|")),
      };
    case "formBlock":
    case "conversionSection":
      return { heading: block.title || stripHtml(block.introHtml).slice(0, 80), textHash: hash(stripHtml(block.bodyHtml || block.introHtml)) };
    default:
      return { heading: stripHtml(block.html || block.title || "").slice(0, 80), textHash: hash(stripHtml(block.html || JSON.stringify(block.items || block.buttons || ""))) };
  }
}

function faqKey(items) {
  return items.map((i) => i.question).join("|");
}

function classify(block, seen, index) {
  const { textHash } = describeBlock(block);
  const key = `${block.type}:${textHash}`;
  if (seen.has(key)) {
    if (block.type === "faq") return "DUPLICATE_FAQ";
    if (block.type === "formBlock" || block.type === "conversionSection") return "DUPLICATE_FORM";
    if (block.type === "ctaStrip" || (block.type === "richText" && /חייגו/.test(stripHtml(block.html)))) return "DUPLICATE_CTA";
    if (block.type === "featureGrid" || block.type === "storageSolutionsGrid") return "DUPLICATE_TEMPLATE";
    return "DUPLICATE_TEMPLATE";
  }
  seen.add(key);
  if (block.type === "ctaStrip") return "DUPLICATE_CTA";
  return "UNIQUE_CONTENT";
}

const report = { generated: new Date().toISOString(), pages: [] };

for (const page of REFERENCE) {
  let blocks = [];
  if (page.file) {
    const data = JSON.parse(readFileSync(join(ROOT, "src/content/structured", page.file), "utf8"));
    blocks = data.blocks || [];
  } else {
    blocks = [{ type: "article", id: "body", html: "article body" }];
  }
  const seen = new Set();
  const sections = blocks.map((block, index) => {
    const meta = describeBlock(block);
    return {
      sectionId: block.id || `s${index + 1}`,
      type: block.type,
      heading: meta.heading,
      normalizedTextHash: meta.textHash,
      classification: classify(block, seen, index),
      sourceLocation: `structured/${page.file || "article"}`,
    };
  });
  const dupes = sections.filter((s) => s.classification.startsWith("DUPLICATE"));
  report.pages.push({
    path: page.path,
    productionLogicalSections: page.productionSections,
    localLogicalSections: sections.length,
    duplicateSectionsFiltered: dupes.length,
    sections,
  });
}

mkdirSync(join(ROOT, "audit/reports"), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

const md = [
  "# Phase 2B.3D — Section Deduplication Audit",
  "",
  `Generated: ${report.generated}`,
  "",
  ...report.pages.map((p) => {
    return [
      `## ${p.path}`,
      "",
      `- Production logical sections: **${p.productionLogicalSections}**`,
      `- Local logical sections: **${p.localLogicalSections}**`,
      `- Duplicate classifications in inventory: **${p.duplicateSectionsFiltered}**`,
      "",
      "| ID | Type | Heading | Classification |",
      "|----|------|---------|----------------|",
      ...p.sections.map((s) => `| ${s.sectionId} | ${s.type} | ${s.heading.replace(/\|/g, "/")} | ${s.classification} |`),
      "",
    ].join("\n");
  }),
].join("\n");

writeFileSync(OUT_MD, md);
console.log("Wrote", OUT_JSON);
