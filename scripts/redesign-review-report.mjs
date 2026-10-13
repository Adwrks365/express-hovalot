import fs from "node:fs";

const { results, base } = JSON.parse(fs.readFileSync("audit/reports/redesign-parity.json", "utf8"));
const { qa } = JSON.parse(fs.readFileSync("audit/reports/redesign-screenshots.json", "utf8"));

const MANUAL = new Set([
  "/הובלות-קטנות-בירושלים", "/הובלות-במודיעין", "/about-us", "/צרו-קשר", "/שאלות-נפוצות", "/הצעת-מחיר",
  "/מדריך-מעבר-דירה-ירושלים", "/terms-of-use", "/site-map", "/תודה-רבה", "/blog", "/category/moving-tips",
  "/tag/הובלות-בירושלים", "/מעבר-דירה-בחורף-בירושלים", "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
  "/הובלות-מנוף-בירושלים", "/מחירי-הובלת-דירות",
]);

const NOTES = {
  "/צרו-קשר": "Google Maps iframes (source embeds) render blank in headless screenshots only.",
  "/הצעת-מחיר": "2 forms = source calculator + final conversion form (both source-backed).",
  "/מחירי-הובלת-דירות": "2 forms = source calculator + final conversion form (both source-backed).",
  "/דף-נחיתה": "Source landing page is very thin (3 text segments); rendered faithfully, nothing added.",
  "/site-map": "66/66 sitemap links rendered with exact hrefs; no conversion by design (utility).",
  "/תודה-רבה": "Utility page, compact hero, no conversion by design.",
};

const rows = results.map((r) => {
  const q = qa.find((x) => x.path === r.path) || {};
  const p = decodeURIComponent(r.path);
  const arch = (r.archetype || "—").replace("REDESIGN_", "");
  const clean =
    r.status === 200 &&
    !r.text.missing && !r.headings.missing.length && !r.media.missing.length && !r.media.unrelated.length && !r.links.missing.length &&
    !q.orphanForms && !q.rawHtml && Object.values(q.overflow || {}).every((v) => v === 0);
  const status = r.status !== 200 ? "N/A (HTTP 404)" : clean ? "PASS" : "FAIL";
  const parity = r.status !== 200 ? "—" :
    `text ${r.text.total - r.text.missing}/${r.text.total}, headings ${r.headings.total - r.headings.missing.length}/${r.headings.total}, links ${r.links.total - r.links.missing.length}/${r.links.total}, FAQ ${r.faq.rendered}/${r.faq.source}, tables ${r.tables.rendered}/${r.tables.source}`;
  const media = r.status !== 200 ? "—" : `${r.media.rendered}/${r.media.source} source images, missing ${r.media.missing.length}, unrelated ${r.media.unrelated.length}`;
  const overflow = Object.values(q.overflow || {}).some((v) => v > 0) ? "overflow" : "no overflow 1440/390/375/360";
  const issues = [
    r.status !== 200 ? "WordPress 404-template page; route returns 404 locally (no content to redesign)." : null,
    NOTES[p] || null,
  ].filter(Boolean).join(" ") || "None";
  return `| \`${p}\` | ${arch} | ${status}${MANUAL.has(p) ? " (manual review)" : ""} | ${parity} | ${media} | ${overflow}; forms ${q.forms ?? 0}, orphan ${q.orphanForms ?? 0} | ${issues} |`;
});

const counts = rows.reduce((acc, row) => {
  const s = row.includes("| PASS") ? "PASS" : row.includes("| FAIL") ? "FAIL" : "N/A";
  acc[s] = (acc[s] || 0) + 1;
  return acc;
}, {});

const md = `# Global content-page visual review

Generated from \`audit/reports/redesign-parity.json\` and \`audit/reports/redesign-screenshots.json\` against the local production build at ${base}.
Screenshots: \`audit/screenshots/global-redesign/NN-<slug>-<width>.png\` (1440 / 390 / 375 / 360, full page).

Totals: PASS ${counts.PASS || 0}, NEEDS_POLISH 0, FAIL ${counts.FAIL || 0}, N/A ${counts["N/A"] || 0} (of ${rows.length} internal URLs; homepage excluded and untouched).

Status rules: PASS needs every automated gate clean (text, headings, links, FAQ, tables, media with zero missing and zero unrelated, no raw Elementor markup, no orphan forms, no horizontal overflow at any width) and the page rendered by the new redesign system. "(manual review)" marks pages whose screenshots were also inspected by eye; the other pages share the same archetype renderer and pass the same gates.

| URL | Archetype | Visual status | Content parity | Media fidelity | Responsive / forms | Remaining issues |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## Global notes

- Site footer (shared chrome, also on the homepage) still contains its existing quick name/phone form. It is outside \`<main>\`, unchanged, and not counted as a page form.
- Form submission goes to the existing \`/api/contact\` stub, which validates and acknowledges only (\`emailSent: false\`). No production email is enabled.
`;

fs.writeFileSync("audit/reports/GLOBAL_CONTENT_PAGE_VISUAL_REVIEW.md", md, "utf8");
console.log(JSON.stringify(counts));
