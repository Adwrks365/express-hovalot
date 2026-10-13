/**
 * SEO audit: title, description, canonical, favicon, robots from SSR HTML.
 */
import * as cheerio from "cheerio";
import {
  PROD,
  writeJson,
  normPath,
  prodUrl,
  fetchRedirectChain,
  getAllContentPaths,
  getContractPaths,
  parsePositionCsv,
  defaultCsvPath,
} from "./seo-audit-common.mjs";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function parseHead(html, requestPath) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const desc = $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
  const robots = $('meta[name="robots"]').attr("content")?.trim() || "";
  const icons = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
    .map((_, el) => ({
      rel: $(el).attr("rel"),
      href: $(el).attr("href"),
      sizes: $(el).attr("sizes"),
    }))
    .get();
  const hasFaviconIco = icons.some((i) => (i.href || "").includes("favicon.ico"));
  const hasPng48 = icons.some((i) => (i.href || "").match(/icon.*48|48x48/i));
  const hasApple = icons.some((i) => (i.rel || "").includes("apple"));

  const expectedCanonical = `${PROD}${requestPath === "/" ? "/" : requestPath}`;
  let canonicalPath = null;
  if (canonical) {
    try {
      canonicalPath = normPath(new URL(canonical).pathname);
    } catch {
      canonicalPath = "invalid";
    }
  }

  const issues = [];
  if (!title) issues.push("missing_title");
  if (title.length > 70) issues.push("title_long");
  if (!desc) issues.push("missing_description");
  if (desc.length > 170) issues.push("description_long");
  if (!canonical) issues.push("missing_canonical");
  else if (canonicalPath !== requestPath) issues.push("canonical_mismatch");
  if (robots.match(/noindex/i)) issues.push("noindex");
  if (!icons.length) issues.push("missing_icon_links");
  if (!hasFaviconIco && !hasPng48) issues.push("no_raster_favicon");

  return {
    title,
    titleLen: title.length,
    description: desc.slice(0, 200),
    descriptionLen: desc.length,
    canonical,
    canonicalPath,
    robots: robots || "(default index)",
    icons,
    hasFaviconIco,
    hasPng48,
    hasApple,
    issues,
  };
}

async function main() {
  const generated = new Date().toISOString();
  const content = getAllContentPaths();
  const csvRows = parsePositionCsv(defaultCsvPath());
  const SKIP_PATHS = new Set(["/שגיאה-404-1/", "/שגיאה-404-2/"]);
  const priorityPaths = new Set([
    ...csvRows.filter((r) => r.path).map((r) => r.path),
    ...getContractPaths()
      .filter((c) => c.expectedStatus === 200)
      .map((c) => c.path)
      .filter((p) => !SKIP_PATHS.has(p)),
  ]);

  const results = [];
  for (const p of [...priorityPaths].sort()) {
    const r = await fetchRedirectChain(prodUrl(p));
    if (r.status !== 200) {
      results.push({ path: p, httpStatus: r.status, head: null, issues: ["http_not_200"] });
      await delay(80);
      continue;
    }
    const head = parseHead(r.html, p);
    const record = content.find((c) => c.path === p);
    const dataCanonical = record?.seo?.canonical || "";
    let dataCanonicalPath = null;
    if (dataCanonical) {
      try {
        dataCanonicalPath = normPath(new URL(dataCanonical).pathname);
      } catch {
        dataCanonicalPath = "invalid";
      }
    }
    if (dataCanonicalPath && dataCanonicalPath !== p) head.issues.push("pages_json_canonical_mismatch");
    results.push({
      path: p,
      httpStatus: 200,
      head,
      pagesJsonCanonical: dataCanonical,
      pagesJsonTitle: record?.seo?.title || record?.title,
    });
    await delay(80);
  }

  const homepage = await fetchRedirectChain(`${PROD}/`);
  const homeHead = homepage.status === 200 ? parseHead(homepage.html, "/") : null;

  const summary = {
    pagesChecked: results.length,
    missingTitle: results.filter((r) => r.head?.issues?.includes("missing_title")).length,
    missingDescription: results.filter((r) => r.head?.issues?.includes("missing_description")).length,
    canonicalMismatch: results.filter((r) => r.head?.issues?.includes("canonical_mismatch")).length,
    noRasterFavicon: results.filter((r) => r.head?.issues?.includes("no_raster_favicon")).length,
    noindex: results.filter((r) => r.head?.issues?.includes("noindex")).length,
    httpErrors: results.filter((r) => r.httpStatus !== 200).length,
  };

  writeJson("audit-serp-metadata.json", { generated, base: PROD, summary, homepage: homeHead, results });
  console.log("audit-serp-metadata.json written", summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
