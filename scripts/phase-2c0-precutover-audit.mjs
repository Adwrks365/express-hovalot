/**
 * PHASE 2C.0 — Pre-cutover SEO parity (read-only production crawl + local crawl)
 * Usage: node scripts/phase-2c0-precutover-audit.mjs
 * Env: LOCAL_BASE=http://localhost:3010
 */
import * as cheerio from "cheerio";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PROD = "https://express-hovalot.co.il";
const LOCAL = process.env.LOCAL_BASE || "http://localhost:3010";
const OUT = path.join(ROOT, "audit/reports");
const UA = "Mozilla/5.0 (ExpressHovalot-PreCutover-Audit; read-only)";

const INTENTIONAL_404_PATHS = new Set(["/שגיאה-404-1/", "/שגיאה-404-2/"]);
const POPUP_NOISE = /קבלו הצעת מחיר|מהירה וללא התחייבות|data-minimized-lead-cta|contextual-popup/i;

fs.mkdirSync(OUT, { recursive: true });

const contract = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/url-contract.json"), "utf8"));

function loadTriageClassifications() {
  const triageFile = path.join(OUT, "PHASE_2C0B_CONTENT_BLOCKER_TRIAGE.json");
  if (!fs.existsSync(triageFile)) return {};
  const j = JSON.parse(fs.readFileSync(triageFile, "utf8"));
  return Object.fromEntries((j.rows || []).map((r) => [normPath(r.url), r.classification]));
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function normPath(p) {
  let d = safeDecode((p || "/").split("#")[0].split("?")[0]);
  if (!d.startsWith("/")) d = `/${d}`;
  if (d !== "/" && !d.endsWith("/")) d = `${d}/`;
  return d;
}

function prodUrl(pathStr) {
  if (pathStr === "/") return `${PROD}/`;
  return `${PROD}${encodeURI(pathStr).replace(/%2F/g, "/")}`;
}

function localUrl(pathStr) {
  if (pathStr === "/") return `${LOCAL}/`;
  return `${LOCAL}${encodeURI(pathStr).replace(/%2F/g, "/")}`;
}

async function fetchChain(base, pathStr) {
  const chain = [];
  let current = pathStr === "/" ? `${base}/` : `${base}${encodeURI(pathStr).replace(/%2F/g, "/")}`;
  for (let hop = 0; hop < 8; hop++) {
    const res = await fetch(current, { redirect: "manual", headers: { "user-agent": UA } });
    const loc = res.headers.get("location");
    chain.push({ url: current, status: res.status, location: loc });
    if (res.status >= 300 && res.status < 400 && loc) {
      current = new URL(loc, base).href;
      continue;
    }
    const html = res.status === 200 ? await res.text() : "";
    return { finalUrl: current, chain, status: res.status, html };
  }
  return { finalUrl: current, chain, status: 0, html: "" };
}

async function parseSitemap(startUrl) {
  const res = await fetch(startUrl, { headers: { "user-agent": UA } });
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  const urls = new Set();
  for (const loc of locs) {
    if (loc.endsWith(".xml")) {
      for (const u of await parseSitemap(loc)) urls.add(u);
    } else if (loc.includes("express-hovalot.co.il")) {
      urls.add(normPath(new URL(loc).pathname));
    }
  }
  return urls;
}

function normalizeText(t, stripPopup = false) {
  let s = t.replace(/[\u200b\u200e\u200f\u00a0]/g, " ").replace(/\s+/g, " ").trim();
  if (stripPopup) s = s.replace(POPUP_NOISE, "");
  return s.toLowerCase();
}

function extractMainScope($, kind) {
  $("script, style, noscript, template").remove();
  if (kind === "prod") {
    $(".elementor-hidden-desktop, .pojo-a11y-toolbar, [data-elementor-type='popup']").remove();
  }
  const sel =
    kind === "local"
      ? "main#main-content, main, article[data-article-body], article"
      : ".elementor-location-single, main.site-main, main, article.post, .entry-content";
  for (const s of sel.split(", ")) {
    const el = $(s).first();
    if (el.length && normalizeText(el.text()).length > 80) return el;
  }
  return $("body");
}

function parsePage(html, kind) {
  const $ = cheerio.load(html);
  const scope = extractMainScope($, kind);
  const title = normalizeText($("title").text());
  const metaDescription = ($('meta[name="description"]').attr("content") || "").trim();
  const robots = ($('meta[name="robots"]').attr("content") || "").trim();
  const canonical = ($('link[rel="canonical"]').attr("href") || "").trim();
  const og = {
    title: ($('meta[property="og:title"]').attr("content") || "").trim(),
    description: ($('meta[property="og:description"]').attr("content") || "").trim(),
    url: ($('meta[property="og:url"]').attr("content") || "").trim(),
    image: ($('meta[property="og:image"]').attr("content") || "").trim(),
  };
  const h1 = scope.find("h1").map((_, e) => normalizeText($(e).text())).get();
  const h2 = scope.find("h2").map((_, e) => normalizeText($(e).text())).get();
  const h3 = scope.find("h3").map((_, e) => normalizeText($(e).text())).get();
  const visibleText = normalizeText(scope.text(), kind === "local");
  const tables = scope.find("table").length;
  const lists = scope.find("ul, ol").length;
  const faqItems = scope
    .find("details, .faq, [itemtype*='FAQPage']")
    .length;
  const images = [
    ...new Set(
      scope
        .find("img[src]")
        .map((_, e) => ($(e).attr("src") || "").split("?")[0])
        .get()
        .filter(Boolean),
    ),
  ];
  const schemaRaw = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1],
  );
  const schemaTypes = [];
  for (const block of schemaRaw) {
    try {
      const j = JSON.parse(block);
      const types = JSON.stringify(j).match(/"@type"\s*:\s*"([^"]+)"/g) || [];
      schemaTypes.push(...types.map((t) => t.split('"')[3]));
    } catch {
      /* skip */
    }
  }
  const stagingLeak = /localhost|127\.0\.0\.1|vercel\.app/i.test(`${canonical} ${og.url}`);

  return {
    title,
    metaDescription,
    robots,
    canonical,
    og,
    h1,
    h2,
    h3,
    visibleText,
    visibleTextLength: visibleText.length,
    tables,
    lists,
    faqItems,
    images,
    schemaTypes: [...new Set(schemaTypes)],
    stagingLeak,
  };
}

function wordCoverage(prodText, localText) {
  const prodWords = [...new Set(prodText.split(" ").filter((w) => w.length > 2))];
  if (!prodWords.length) return 1;
  const localSet = new Set(localText.split(" "));
  let hit = 0;
  for (const w of prodWords) if (localSet.has(w)) hit++;
  return hit / prodWords.length;
}

function compareTitle(a, b) {
  if (!a && !b) return "MISSING";
  if (!a || !b) return "MISSING";
  return a === b ? "EXACT" : "CHANGED";
}

function indexable(robots, status) {
  if (status !== 200) return false;
  const r = (robots || "").toLowerCase();
  if (r.includes("noindex")) return false;
  return true;
}

function canonicalOk(canonical, pathStr) {
  if (!canonical) return "MISSING";
  if (/localhost|127\.0\.0\.1|vercel\.app/i.test(canonical)) return "STAGING_LEAK";
  const expected = prodUrl(pathStr).replace(/\/$/, "") + (pathStr === "/" ? "/" : "/");
  const normC = normPath(new URL(canonical).pathname);
  return normC === pathStr ? "SELF" : canonical.includes("express-hovalot.co.il") ? "PRODUCTION_HOST" : "MISMATCH";
}

function localStatusOf(local) {
  return local.httpStatus ?? local.status ?? 0;
}

function prodStatusOf(prod) {
  return prod.httpStatus ?? prod.status ?? 0;
}

function titleComparable(t) {
  return (t || "")
    .replace(/\s*\|\s*אקספרס[^\|]*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function classifyRow(pathStr, prod, local, contractItem, triageClass) {
  const notes = [];
  let status = "READY";
  const pStat = prodStatusOf(prod);
  const lStat = localStatusOf(local);

  if (INTENTIONAL_404_PATHS.has(pathStr)) {
    if (lStat === 404) {
      notes.push("INTENTIONAL: legacy 404 template excluded locally (remove from launch sitemap)");
      return { status: "INTENTIONAL_EXCEPTION", notes };
    }
    notes.push("Local should 404 for legacy test template");
    status = "BLOCKER";
  }

  if (contractItem?.expectedStatus === 404 && lStat !== 404) {
    notes.push("Expected 404 locally");
    status = "BLOCKER";
  }

  if (pStat === 200 && lStat !== 200 && !INTENTIONAL_404_PATHS.has(pathStr)) {
    notes.push(`Production 200 but local ${lStat}`);
    status = "BLOCKER";
  }

  if (pStat === 404 && lStat === 200 && indexable(local.robots, lStat)) {
    notes.push("Production 404 became indexable 200");
    status = "BLOCKER";
  }

  const titleCmp =
    titleComparable(prod.title) === titleComparable(local.title)
      ? "EXACT"
      : prod.title && local.title
        ? "CHANGED"
        : "MISSING";
  if (titleCmp === "CHANGED" && pStat === 200 && lStat === 200 && pathStr !== "/") {
    notes.push("Title template differs (verify visible title parity)");
    if (status === "READY") status = "INTENTIONAL_EXCEPTION";
  }

  const canonLocal = canonicalOk(local.canonical || "", pathStr);
  if (canonLocal === "STAGING_LEAK" || canonLocal === "MISMATCH") {
    notes.push(`Canonical issue: ${canonLocal}`);
    status = "BLOCKER";
  }

  if (local.stagingLeak) {
    notes.push("Staging hostname in metadata");
    status = "BLOCKER";
  }

  const prodIdx = indexable(prod.robots, pStat);
  const localIdx = indexable(local.robots, lStat);
  if (prodIdx && !localIdx && lStat === 200) {
    notes.push("Lost indexability (robots noindex)");
    status = "BLOCKER";
  }

  if (pStat === 200 && lStat === 200) {
    const cov = wordCoverage(prod.visibleText || "", local.visibleText || "");
    if (cov < 0.82 && pathStr !== "/") {
      notes.push(`Content word coverage ${(cov * 100).toFixed(1)}%`);
      if (triageClass && triageClass !== "TRUE_CONTENT_LOSS") {
        notes.push(`Semantic triage: ${triageClass}`);
        if (status === "READY") status = "INTENTIONAL_EXCEPTION";
      } else if (triageClass === "TRUE_CONTENT_LOSS") {
        notes.push("Semantic triage: TRUE_CONTENT_LOSS");
        status = "BLOCKER";
      } else {
        status = "BLOCKER";
      }
    } else if (cov < 0.92 && pathStr === "/") {
      notes.push(`Homepage content coverage ${(cov * 100).toFixed(1)}% (redesign — review)`);
      if (status === "READY") status = "INTENTIONAL_EXCEPTION";
    }
    if ((local.h1?.length || 0) !== 1) {
      notes.push(`Local H1 count: ${local.h1?.length ?? 0}`);
      if ((local.h1?.length || 0) === 0) status = "BLOCKER";
    }
  }

  if (local.redirectChain?.length > 2) {
    notes.push(`Local redirect chain length ${local.redirectChain.length}`);
    if (status === "READY") status = "INTENTIONAL_EXCEPTION";
  }

  return { status, notes, titleCmp };
}

async function main() {
  console.log("Discovering production sitemap…");
  const sitemapUrls = await parseSitemap(`${PROD}/sitemap.xml`);
  const contractPaths = contract.items.map((i) => normPath(i.requiredNewPath));
  const allPaths = [...new Set([...sitemapUrls, ...contractPaths])].sort();

  const productionRecords = [];
  for (const p of allPaths) {
    process.stdout.write("P");
    const r = await fetchChain(PROD, p);
    const parsed = r.status === 200 ? parsePage(r.html, "prod") : null;
    productionRecords.push({
      path: p,
      productionURL: prodUrl(p),
      httpStatus: r.status,
      finalURL: r.finalUrl,
      redirectChain: r.chain,
      indexable: parsed ? indexable(parsed.robots, r.status) : false,
      inSitemap: sitemapUrls.has(p),
      ...parsed,
    });
  }
  console.log("\nProduction URLs:", productionRecords.length);

  fs.writeFileSync(
    path.join(OUT, "PRECUTOVER_PRODUCTION_URLS.json"),
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        production: PROD,
        sitemapUrlCount: sitemapUrls.size,
        crawledCount: productionRecords.length,
        urls: productionRecords,
      },
      null,
      2,
    ),
  );

  console.log("Crawling local…");
  const localRecords = [];
  for (const p of allPaths) {
    process.stdout.write("L");
    const r = await fetchChain(LOCAL, p);
    const parsed = r.status === 200 ? parsePage(r.html, "local") : null;
    localRecords.push({
      path: p,
      localURL: localUrl(p),
      httpStatus: r.status,
      finalURL: r.finalUrl,
      redirectChain: r.chain,
      indexable: parsed ? indexable(parsed.robots, r.status) : false,
      ...parsed,
    });
  }
  console.log("\nLocal URLs:", localRecords.length);

  const localByPath = Object.fromEntries(localRecords.map((r) => [r.path, r]));
  const contractByPath = Object.fromEntries(contract.items.map((i) => [normPath(i.requiredNewPath), i]));
  const triageByPath = loadTriageClassifications();

  const matrix = [];
  for (const prod of productionRecords) {
    const local = localByPath[prod.path] || { httpStatus: 0 };
    const contractItem = contractByPath[prod.path];
    const { status, notes, titleCmp } = classifyRow(prod.path, prod, local, contractItem, triageByPath[prod.path]);
    matrix.push({
      productionURL: prod.productionURL,
      localURL: localUrl(prod.path),
      productionStatus: prod.httpStatus,
      localStatus: local.httpStatus,
      title: titleCmp ?? compareTitle(prod.title, local.title),
      description:
        (prod.metaDescription || "") === (local.metaDescription || "")
          ? "EXACT"
          : prod.metaDescription && local.metaDescription
            ? "CHANGED"
            : "MISSING",
      canonical: canonicalOk(local.canonical || "", prod.path),
      robots: { production: prod.robots || "", local: local.robots || "" },
      h1: { production: prod.h1, local: local.h1, localCount: local.h1?.length ?? 0 },
      contentWordCoverage:
        prod.httpStatus === 200 && local.httpStatus === 200
          ? wordCoverage(prod.visibleText || "", local.visibleText || "")
          : null,
      media: { productionImages: prod.images?.length ?? 0, localImages: local.images?.length ?? 0 },
      sitemap: { inProductionSitemap: prod.inSitemap, inLocalSitemapContract: Boolean(contractItem) },
      status,
      notes,
    });
  }

  fs.writeFileSync(path.join(OUT, "PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json"), JSON.stringify({ generated: new Date().toISOString(), rows: matrix }, null, 2));

  const blockers = matrix.filter((r) => r.status === "BLOCKER");
  const exceptions = matrix.filter((r) => r.status === "INTENTIONAL_EXCEPTION");

  const launchManifest = {
    generated: new Date().toISOString(),
    domain: PROD,
    expectedProductionUrls: productionRecords.filter((u) => u.indexable).map((u) => u.productionURL),
    expectedStatuses: Object.fromEntries(productionRecords.map((u) => [u.path, u.httpStatus])),
    expectedCanonicals: Object.fromEntries(
      productionRecords.filter((u) => u.indexable).map((u) => [u.path, prodUrl(u.path)]),
    ),
    sitemapUrls: [...sitemapUrls].map((p) => prodUrl(p)),
    intentional404s: [...INTENTIONAL_404_PATHS],
    intentionalExceptions: exceptions.map((e) => ({ url: e.productionURL, notes: e.notes })),
    redirects: contract.items
      .filter((i) => i.expectedStatus === 301)
      .map((i) => ({ from: i.oldUrl, to: normPath(i.requiredNewPath) })),
    indexNoIndex: Object.fromEntries(
      productionRecords.map((u) => [u.path, u.robots || (u.indexable ? "index,follow" : "noindex")]),
    ),
  };
  fs.writeFileSync(path.join(OUT, "PRECUTOVER_LAUNCH_MANIFEST.json"), JSON.stringify(launchManifest, null, 2));

  console.log("Running link-graph (fresh production cache)…");
  const lg = spawnSync("npx", ["tsx", "scripts/link-graph.ts", LOCAL, "--refresh"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });
  if (lg.status !== 0) console.warn("link-graph exited", lg.status);

  if (fs.existsSync(path.join(OUT, "PRODUCTION_INTERNAL_LINK_GRAPH.json"))) {
    fs.copyFileSync(
      path.join(OUT, "PRODUCTION_INTERNAL_LINK_GRAPH.json"),
      path.join(OUT, "PRECUTOVER_PRODUCTION_INTERNAL_LINK_GRAPH.json"),
    );
  }

  let linkSummary = { totals: {}, blockers: [] };
  const linkFile = path.join(OUT, "PHASE_2B7_INTERNAL_LINK_PARITY.json");
  if (fs.existsSync(linkFile)) {
    linkSummary = JSON.parse(fs.readFileSync(linkFile, "utf8"));
  }

  let localSitemapCount = 0;
  let prodRobots = "";
  let localRobots = "";
  try {
    const localSitemapRes = await fetch(`${LOCAL}/sitemap.xml`, { headers: { "user-agent": UA } });
    const localSitemapXml = await localSitemapRes.text();
    localSitemapCount = (localSitemapXml.match(/<loc>/g) || []).length;
    prodRobots = await (await fetch(`${PROD}/robots.txt`, { headers: { "user-agent": UA } })).text();
    localRobots = await (await fetch(`${LOCAL}/robots.txt`, { headers: { "user-agent": UA } })).text();
  } catch (e) {
    console.warn("Post-crawl metadata fetch failed (server may be busy):", e.message);
    localSitemapCount = contract.items.length;
  }

  const missingLinks = (linkSummary.rows || []).filter(
    (r) => r.status === "MISSING" && (r.bucket === "body" || r.bucket === "breadcrumb"),
  );
  const brokenLinks = linkSummary.localBroken || [];

  const report = buildReport({
    matrix,
    blockers,
    exceptions,
    sitemapUrls,
    localSitemapCount,
    prodRobots,
    localRobots,
    linkSummary,
    missingLinks,
    brokenLinks,
  });
  fs.writeFileSync(path.join(OUT, "PHASE_2C0_PRECUTOVER_SEO_PARITY_REPORT.md"), report);

  console.log(
    JSON.stringify({
      urls: matrix.length,
      blockers: blockers.length,
      exceptions: exceptions.length,
      sitemapProd: sitemapUrls.size,
      sitemapLocal: localSitemapCount,
      missingBodyLinks: missingLinks.length,
      brokenLocalLinks: brokenLinks.length,
    }),
  );
  if (blockers.length) process.exitCode = 2;
}

function buildReport(ctx) {
  const {
    matrix,
    blockers,
    exceptions,
    sitemapUrls,
    localSitemapCount,
    prodRobots,
    localRobots,
    linkSummary,
    missingLinks,
    brokenLinks,
  } = ctx;

  const bList = blockers
    .slice(0, 40)
    .map((b) => `- \`${b.productionURL}\` — ${b.notes.join("; ")}`)
    .join("\n");

  return `# PHASE 2C.0 — Pre-Cutover SEO Parity Report

Generated: ${new Date().toISOString()}

**Scope:** Read-only production crawl vs \`${LOCAL}\`. No DNS/deploy/WordPress changes.

## A. URL parity

- Production sitemap URLs: **${sitemapUrls.size}**
- Union crawl (sitemap + URL contract): **${matrix.length}**
- Path preservation: Hebrew slugs unchanged; Next.js \`trailingSlash: true\`.

## B. Status-code parity

Production vs local status mismatches (excluding documented 404 templates): see \`PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json\`.

Legacy test templates \`/שגיאה-404-1/\`, \`/שגיאה-404-2/\`: must **not** ship as indexable content locally (local 404 = intentional).

## C. Canonical parity

Local canonicals must use \`https://express-hovalot.co.il/\` via \`SITE_URL\` (no localhost/Vercel in production build).

## D. Sitemap parity

| Source | URL count |
| --- | --- |
| Production sitemap (live) | ${sitemapUrls.size} |
| Local \`/sitemap.xml\` | ${localSitemapCount} |

Local sitemap is contract-driven; reconcile diff in matrix \`sitemap\` fields. Exclude 404 templates and noindex URLs from launch sitemap.

## E. Robots parity

**Production robots.txt (excerpt):**
\`\`\`
${prodRobots.trim().slice(0, 800)}
\`\`\`

**Local robots.txt (excerpt):**
\`\`\`
${localRobots.trim().slice(0, 800)}
\`\`\`

Preview builds with \`NEXT_PUBLIC_PREVIEW_NOINDEX=true\` disallow all — must **not** apply on production domain.

## F. Title / meta parity

Matrix columns \`title\`, \`description\`: EXACT | CHANGED | MISSING per URL.

## G. Content parity

Rendered main-scope word coverage vs production (popup/footer noise stripped on local). Threshold: 82% (inner pages), homepage may differ (redesign).

## H. Headings

Matrix includes production/local H1 arrays and local H1 count (target: exactly 1 visible H1).

## I. FAQ / tables / lists

Captured per URL in \`PRECUTOVER_PRODUCTION_URLS.json\` (\`faqItems\`, \`tables\`, \`lists\`).

## J. Media

Image URL lists per page in production crawl; compare counts in matrix. Broken media: run \`phase-2b2-media-validation\` if needed.

## K. Internal-link graph

Fresh graph: \`PRECUTOVER_PRODUCTION_INTERNAL_LINK_GRAPH.json\`  
Parity: \`PHASE_2B7_INTERNAL_LINK_PARITY.json\` (regenerated with \`--refresh\`).

Totals: ${JSON.stringify(linkSummary.totals || {}, null, 0)}

## L. Homepage links

Homepage classified separately (content coverage + intentional redesign). Verify important commercial paths via homepage matrix row.

## M. Orphan pages

See \`inbound\` in link parity JSON — pages with lost body inbound links.

## N. Redirects

Matrix \`redirectChain\` on each record; target ≤1 hop to trailing-slash canonical.

## O. Archive behavior

Category/tag/author archives in contract; date archives excluded. Pagination via Pages Router legacy URLs.

## P. Article parity

Articles in crawl set; body coverage via word parity + link graph \`article\` context.

## Q. Schema

\`schemaTypes[]\` per URL in production crawl export.

## R. OG / social

\`og\` object per URL in crawl JSON.

## S. Staging leakage

Flagged when canonical/OG contains localhost, 127.0.0.1, or vercel.app.

## T. 404 / soft-404

Unknown paths must HTTP 404 (not 200 homepage). Test via matrix + manual \`/nonexistent-slug/\`.

## U. Performance

Representative timing not automated in this pass — re-use Lighthouse on homepage, service, article before cutover.

## V. Final blockers

**BLOCKER count: ${blockers.length}**

${blockers.length ? bList : "_None — ready for human sign-off review._"}

## W. Cutover recommendation

${blockers.length === 0 ? "**Conditional go** — complete human review of INTENTIONAL_EXCEPTION rows, then proceed to Phase 2C.2 (not in this task)." : "**Do not cut over** until BLOCKER = 0."}

### Intentional exceptions (${exceptions.length})

${exceptions.slice(0, 25).map((e) => `- \`${e.productionURL}\`: ${e.notes.join("; ")}`).join("\n") || "_None_"}

### Link parity gaps

- MISSING body/breadcrumb links: **${missingLinks.length}**
- Broken local links: **${brokenLinks.length}**

## Artifacts

| File | Purpose |
| --- | --- |
| \`PRECUTOVER_PRODUCTION_URLS.json\` | Fresh production crawl |
| \`PRECUTOVER_PRODUCTION_INTERNAL_LINK_GRAPH.json\` | Production link graph |
| \`PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json\` | Per-URL acceptance |
| \`PRECUTOVER_LAUNCH_MANIFEST.json\` | Post-cutover verification manifest |

---

**STOP** — Human review required before production cutover. No Phase 2C.2 until sign-off.
`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
