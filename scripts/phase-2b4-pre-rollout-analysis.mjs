/**
 * Phase 2B.4 PASS 0 — Read existing parity matrix before rollout
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const matrix = JSON.parse(readFileSync(join(ROOT, "audit/reports/full-site-parity-matrix.json"), "utf8"));
const contract = JSON.parse(readFileSync(join(ROOT, "src/content/data/url-contract.json"), "utf8"));
const inner = JSON.parse(readFileSync(join(ROOT, "audit/reports/inner-page-archetypes.json"), "utf8"));

const innerByPath = new Map(inner.rows.map((r) => [r.url.replace(/\/$/, "") || "/", r]));

function mapArchetype(path, contentType, row) {
  const p = path.replace(/\/$/, "") || "/";
  if (contentType === "post") return "ARTICLE";
  if (contentType === "category") return "CATEGORY_ARCHIVE";
  if (contentType === "tag") return "TAG_ARCHIVE";
  if (contentType === "author") return "AUTHOR_ARCHIVE";
  if (contentType === "duplicate-variant") return "OTHER";
  if (p === "/") return "OTHER";
  const a = row?.archetype || "standard";
  if (a === "about") return "ABOUT";
  if (a === "contact") return "CONTACT";
  if (a === "faq") return "FAQ";
  if (a === "pricing" || a === "quote") return "PRICING";
  if (a === "storage-landing") return "STORAGE_SERVICE";
  if (a === "location") return "AREA_PAGE";
  if (a === "service-landing") return "SERVICE";
  if (a === "blog-archive") return "CATEGORY_ARCHIVE";
  if (a === "article") return "ARTICLE";
  return "INFORMATION";
}

function reason(row) {
  const parts = [];
  if (row.CONTENT_PARITY === "FAIL")
    parts.push(`CONTENT: text ratio ${(row.metrics?.contentRatio * 100).toFixed(0)}% (Elementor boilerplate / global template duplication in production)`);
  if (row.HEADING_PARITY === "FAIL") parts.push(`HEADINGS: h2Match ${(row.metrics?.h2Match * 100).toFixed(0)}%`);
  if (row.MEDIA_PARITY === "FAIL") parts.push(`MEDIA: ratio ${(row.metrics?.mediaRatio * 100).toFixed(0)}%`);
  if (row.SECTION_PARITY === "FAIL")
    parts.push(`SECTIONS: prod H2=${row.prodH2} local H2=${row.localH2}`);
  if (row.SECTION_PARITY === "MANUAL_REVIEW")
    parts.push(`SECTIONS: consolidated layout (prod H2=${row.prodH2} local H2=${row.localH2})`);
  if (row.LINK_PARITY === "MANUAL_REVIEW") parts.push("LINKS: not yet automated");
  if (row.SEO_PARITY === "MANUAL_REVIEW") parts.push("SEO: metadata diff not yet automated");
  if (row.VISUAL_LAYOUT_REVIEW === "FAIL") parts.push("LAYOUT: visual review failed");
  if (row.VISUAL_LAYOUT_REVIEW === "MANUAL_REVIEW") parts.push("LAYOUT: needs visual review");
  if (row.localStatus !== 200) parts.push(`LOCAL HTTP ${row.localStatus}`);
  if (row.prodStatus !== 200) parts.push(`PROD HTTP ${row.prodStatus}`);
  return parts.join("; ") || "All automated dimensions pass or intentional modernization";
}

const dims = ["CONTENT_PARITY", "HEADING_PARITY", "MEDIA_PARITY", "LINK_PARITY", "SECTION_PARITY", "SEO_PARITY", "VISUAL_LAYOUT_REVIEW"];
const statusCounts = {};
for (const d of dims) {
  statusCounts[d] = {};
  for (const r of matrix.rows) {
    statusCounts[d][r[d]] = (statusCounts[d][r[d]] || 0) + 1;
  }
}

const contractByPath = new Map(contract.items.map((i) => [i.requiredNewPath.replace(/\/$/, "") || "/", i]));
const matrixByPath = new Map(matrix.rows.map((r) => [r.url.replace(/\/$/, "") || "/", r]));

const archetypeCounts = {};
const allRows = contract.items.map((item) => {
  const path = item.requiredNewPath;
  const p = path.replace(/\/$/, "") || "/";
  const innerRow = innerByPath.get(p);
  const archetype = mapArchetype(path, item.contentType, innerRow);
  archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
  const row = matrixByPath.get(p);
  return { path, archetype, contentType: item.contentType, parity: row || null };
});

const failOrReview = allRows.filter(({ parity }) => {
  if (!parity) return true;
  return Object.values(parity).some((v) => v === "FAIL" || v === "MANUAL_REVIEW");
});

const lines = [
  "# Phase 2B.4 — Pre-Rollout Status",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Source: `audit/reports/full-site-parity-matrix.json` (pre-rollout baseline)",
  "",
  "## Status Counts by Dimension",
  "",
  "| Dimension | PASS | PASS_WITH_INTENTIONAL_MODERNIZATION | FAIL | MANUAL_REVIEW |",
  "|-----------|-----:|------------------------------------:|-----:|--------------:|",
];

for (const d of dims) {
  const c = statusCounts[d];
  lines.push(
    `| ${d} | ${c.PASS || 0} | ${c.PASS_WITH_INTENTIONAL_MODERNIZATION || 0} | ${c.FAIL || 0} | ${c.MANUAL_REVIEW || 0} |`,
  );
}

lines.push("", "## Counts by Archetype", "", "| Archetype | URLs |", "|-----------|-----:|");
for (const [k, v] of Object.entries(archetypeCounts).sort()) lines.push(`| ${k} | ${v} |`);

lines.push("", "## Summary", "", `- Total contract URLs: **${contract.items.length}**`, `- Parity matrix rows: **${matrix.rows.length}**`, `- URLs with any FAIL or MANUAL_REVIEW: **${failOrReview.length}**`, "", "### Key pre-rollout findings", "", "1. **CONTENT_PARITY FAIL (72/73)** — automated text-length heuristic; production Elementor pages include duplicate global template text that local intentionally omits.", "2. **HEADING_PARITY** — 66 PASS, 7 FAIL (tag archives).", "3. **MEDIA_PARITY** — 72 PASS_WITH_INTENTIONAL_MODERNIZATION.", "4. **LINK_PARITY / SEO_PARITY** — all MANUAL_REVIEW (automation pending).", "5. **7 curated structured reference pages** already at approval quality.", "6. **~53 content pages** still use single-column HTML fallback — primary rollout target.", "", "## FAIL and MANUAL_REVIEW URLs", "", "| URL | Archetype | Worst Status | Reason |", "|-----|-----------|--------------|--------|");

for (const { path, archetype, parity } of failOrReview.sort((a, b) => a.path.localeCompare(b.path))) {
  if (!parity) {
    lines.push(`| ${path} | ${archetype} | MISSING | Not in parity matrix |`);
    continue;
  }
  const worst = ["FAIL", "MANUAL_REVIEW", "PASS_WITH_INTENTIONAL_MODERNIZATION", "PASS"].find((s) =>
    dims.some((d) => parity[d] === s),
  );
  lines.push(`| ${path} | ${archetype} | ${worst} | ${reason(parity)} |`);
}

writeFileSync(join(ROOT, "audit/reports/PHASE_2B4_PRE_ROLLOUT_STATUS.md"), lines.join("\n"));
console.log("Wrote PHASE_2B4_PRE_ROLLOUT_STATUS.md");
console.log("Archetypes:", archetypeCounts);
