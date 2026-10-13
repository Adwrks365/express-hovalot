/**
 * SEO audit: H1 count and outline (h2-h4) from production HTML.
 */
import * as cheerio from "cheerio";
import {
  PROD,
  writeJson,
  prodUrl,
  fetchRedirectChain,
  getAllContentPaths,
  parsePositionCsv,
  defaultCsvPath,
} from "./seo-audit-common.mjs";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function analyzeHeadings(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  const h1s = $("h1")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean);
  const outline = [];
  for (let level = 1; level <= 4; level++) {
    $(`h${level}`).each((_, el) => {
      outline.push({ level, text: $(el).text().replace(/\s+/g, " ").trim().slice(0, 120) });
    });
  }
  const issues = [];
  if (h1s.length === 0) issues.push("no_h1");
  if (h1s.length > 1) issues.push("multiple_h1");
  let last = 1;
  for (const item of outline) {
    if (item.level > last + 1) issues.push("skipped_heading_level");
    last = item.level;
  }
  return { h1Count: h1s.length, h1Texts: h1s, outline: outline.slice(0, 40), issues: [...new Set(issues)] };
}

async function main() {
  const generated = new Date().toISOString();
  const csvRows = parsePositionCsv(defaultCsvPath());
  const contentPaths = getAllContentPaths().map((c) => c.path);
  const csvPaths = csvRows.filter((r) => r.path).map((r) => r.path);
  const paths = [...new Set([...contentPaths, ...csvPaths])].sort();

  const results = [];
  for (const p of paths) {
    const r = await fetchRedirectChain(prodUrl(p));
    if (r.status !== 200) {
      results.push({ path: p, httpStatus: r.status, headings: null, issues: ["http_not_200"] });
      await delay(80);
      continue;
    }
    const headings = analyzeHeadings(r.html);
    results.push({ path: p, httpStatus: 200, ...headings });
    await delay(80);
  }

  const summary = {
    pagesChecked: results.length,
    noH1: results.filter((r) => r.issues?.includes("no_h1")).length,
    multipleH1: results.filter((r) => r.issues?.includes("multiple_h1")).length,
    skippedLevels: results.filter((r) => r.issues?.includes("skipped_heading_level")).length,
  };

  writeJson("audit-headings.json", { generated, base: PROD, summary, results });
  console.log("audit-headings.json written", summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
