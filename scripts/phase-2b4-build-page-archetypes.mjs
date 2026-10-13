/**
 * Phase 2B.4 — Build page-archetypes.json for all contract URLs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const pages = JSON.parse(readFileSync(join(ROOT, "src/content/data/pages.json"), "utf8"));
const posts = JSON.parse(readFileSync(join(ROOT, "src/content/data/posts.json"), "utf8"));
const contract = JSON.parse(readFileSync(join(ROOT, "src/content/data/url-contract.json"), "utf8"));
const inner = JSON.parse(readFileSync(join(ROOT, "audit/reports/inner-page-archetypes.json"), "utf8"));

const contentByPath = new Map();
for (const item of [...pages, ...posts]) {
  const p = (item.path.startsWith("/") ? item.path : `/${item.slug}`).replace(/\/$/, "") || "/";
  contentByPath.set(p, item);
}

const innerByPath = new Map(inner.rows.map((r) => [r.url.replace(/\/$/, "") || "/", r]));

const REFERENCE_TEMPLATE = {
  ABOUT: "/about-us",
  CONTACT: "/צרו-קשר",
  FAQ: "/שאלות-נפוצות",
  STORAGE_SERVICE: "/אחסון-תכולה-לטווח-קצר",
  SERVICE: "/הובלת-דירה-בירושלים",
  PRICING: "/הצעת-מחיר",
  ARTICLE: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
};

function mapArchetype(path, contentType, innerRow) {
  const p = path.replace(/\/$/, "") || "/";
  if (contentType === "post") return "ARTICLE";
  if (contentType === "category") return "CATEGORY_ARCHIVE";
  if (contentType === "tag") return "TAG_ARCHIVE";
  if (contentType === "author") return "AUTHOR_ARCHIVE";
  if (contentType === "duplicate-variant") return "OTHER";
  const a = innerRow?.archetype || "standard";
  if (a === "about") return "ABOUT";
  if (a === "contact") return "CONTACT";
  if (a === "faq") return "FAQ";
  if (a === "pricing" || a === "quote") return "PRICING";
  if (a === "storage-landing") return "STORAGE_SERVICE";
  if (a === "location") return "AREA_PAGE";
  if (a === "service-landing") return "SERVICE";
  return "INFORMATION";
}

function heroType(archetype) {
  if (archetype === "ABOUT") return "about";
  if (archetype === "ARTICLE") return "article";
  return "internal";
}

const entries = contract.items.map((item) => {
  const path = item.requiredNewPath;
  const p = path.replace(/\/$/, "") || "/";
  const content = contentByPath.get(p);
  const innerRow = innerByPath.get(p);
  const archetype = mapArchetype(path, item.contentType, innerRow);
  const html = content?.contentHtml || "";

  return {
    path,
    wpId: content?.id ?? null,
    contentType: item.contentType,
    archetype,
    referenceTemplate: REFERENCE_TEMPLATE[archetype] || null,
    heroType: heroType(archetype),
    primaryImage: content?.featuredMediaId ?? null,
    faqPresent: innerRow?.faq ?? /שאלות\s*נפוצות/i.test(html),
    formPresent: innerRow?.form ?? /<form\b|wpcf7/i.test(html),
    ctaPresent: /הצעת מחיר|052-500|0525005573/i.test(html),
    specialComponents: [
      innerRow?.table ? "table" : null,
      archetype === "ARTICLE" ? "toc" : null,
      archetype === "CATEGORY_ARCHIVE" ? "pagination" : null,
    ].filter(Boolean),
    notes: item.notes || null,
  };
});

writeFileSync(
  join(ROOT, "src/content/data/page-archetypes.json"),
  JSON.stringify({ generated: new Date().toISOString(), count: entries.length, entries }, null, 2),
);
console.log("Wrote page-archetypes.json", entries.length, "entries");
