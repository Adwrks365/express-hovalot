/**
 * Phase 2B.4 — Visual review index grouped by archetype
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const matrix = JSON.parse(readFileSync(join(ROOT, "audit/reports/full-site-parity-matrix.json"), "utf8"));
const archetypes = JSON.parse(readFileSync(join(ROOT, "src/content/data/page-archetypes.json"), "utf8"));

const archByPath = new Map(archetypes.entries.map((e) => [e.path.replace(/\/$/, "") || "/", e.archetype]));
const matrixByPath = new Map(matrix.rows.map((r) => [r.url.replace(/\/$/, "") || "/", r]));

function slug(path) {
  return path.replace(/^\//, "").replace(/\//g, "_") || "home";
}

function worstStatus(row) {
  if (!row) return "UNKNOWN";
  const order = ["FAIL", "MANUAL_REVIEW", "PASS_WITH_INTENTIONAL_MODERNIZATION", "PASS"];
  for (const s of order) {
    if ([row.CONTENT_PARITY, row.HEADING_PARITY, row.MEDIA_PARITY, row.SECTION_PARITY, row.VISUAL_LAYOUT_REVIEW].includes(s))
      return s;
  }
  return "PASS";
}

const grouped = {};
for (const entry of archetypes.entries) {
  const p = entry.path.replace(/\/$/, "") || "/";
  const arch = entry.archetype;
  if (!grouped[arch]) grouped[arch] = [];
  const row = matrixByPath.get(p);
  grouped[arch].push({
    path: entry.path,
    status: worstStatus(row),
    prodShot: `audit/screenshots/full-site-production/${slug(entry.path)}-desktop.png`,
    localShot: `audit/screenshots/full-site-local/${slug(entry.path)}-desktop.png`,
  });
}

const lines = [
  "# Full Site Visual Review Index",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Compare production vs local screenshots grouped by archetype.",
  "",
];

for (const [arch, rows] of Object.entries(grouped).sort()) {
  lines.push(`## ${arch}`, "", "| URL | Status | Production | Local |", "|-----|--------|------------|-------|");
  for (const r of rows.sort((a, b) => a.path.localeCompare(b.path))) {
    lines.push(`| ${r.path} | ${r.status} | ${r.prodShot} | ${r.localShot} |`);
  }
  lines.push("");
}

writeFileSync(join(ROOT, "audit/reports/FULL_SITE_VISUAL_REVIEW.md"), lines.join("\n"));
console.log("Wrote FULL_SITE_VISUAL_REVIEW.md");
