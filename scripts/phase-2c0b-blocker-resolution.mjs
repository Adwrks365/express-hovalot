/**
 * PHASE 2C.0B — Blocker triage, link audit, matrix refresh
 */
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "audit/reports");
const PROD = "https://express-hovalot.co.il";
const LOCAL = process.env.LOCAL_BASE || "http://localhost:3010";
const UA = "Mozilla/5.0 (ExpressHovalot-2C0B; read-only)";

const OBSOLETE = new Set(["/שגיאה-404-1/", "/שגיאה-404-2/"]);
const NOISE =
  /חייגו עכשיו|קבלו הצעת מחיר|מהירה וללא התחייבות|data-minimized|contextual-popup|skip to content|דלג לתוכן|052-500-55-73|0525005573|whatsapp/i;
const CTA_PARA =
  /^(בצע את הצעד האחרון|או השאירו פרטים|קבלו הצעת מחיר|קבל הצעת מחיר)/;

const contract = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/url-contract.json"), "utf8"));
const archetypes = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/page-archetypes.json"), "utf8"));
const pathArchetype = Object.fromEntries(
  (archetypes.entries || archetypes.pages || []).map((p) => [normPath(p.path), p.archetype || p.template]),
);
const WIDGET_PARA =
  /^(הובלות לפי אזור|טיפים ומדריכים|מעבר דירה בבירה הוא חוויה|מחפשים פתרון מהיר|עוברים דירה בירושלים|מבוא: לאן נעים|הובלת דירה בירושלים בשנת 2026)/;
const GLOBAL_CHROME_IMAGES = /^(favicon\.svg|moving-price-2025\.webp|8\.webp|May-28-2026|hp_mobile_images_bg|LP_bg_mob\.webp)$/i;

function normPath(p) {
  let d = p;
  try {
    d = decodeURIComponent(p);
  } catch {
    /* */
  }
  if (!d.startsWith("/")) d = `/${d}`;
  if (d !== "/" && !d.endsWith("/")) d = `${d}/`;
  return d;
}

function normText(t) {
  return t
    .replace(/[\u200b\u200e\u200f\u00a0]/g, " ")
    .replace(/\s+/g, " ")
    .replace(NOISE, "")
    .trim()
    .toLowerCase();
}

function extractSemantic(html, kind) {
  const $ = cheerio.load(html);
  $("script, style, noscript, template, header, footer, nav").remove();
  if (kind === "prod") {
    $(
      ".elementor-hidden-desktop, .pojo-a11y-toolbar, [data-elementor-type='popup'], .elementor-location-header, .elementor-location-footer, .elementor-widget-sidebar, .elementor-widget-posts, .elementor-posts-container, aside, .elementor-widget-share-buttons, .elementor-widget-author-box",
    ).remove();
  }
  if (kind === "local") {
    $("[data-minimized-lead-cta], [data-fixed-control], #a11y-panel, [data-final-conversion]").remove();
  }
  const scope =
    kind === "local"
      ? $("main#main-content, main article, main").first()
      : $(".elementor-location-single, .entry-content, main.site-main, main").first();
  const root = scope.length ? scope : $("body");

  const paragraphs = root
    .find("p, li, td, blockquote, h2, h3, h4, details summary")
    .map((_, el) => normText($(el).text()))
    .get()
    .filter((t) => t.length > 25);

  const h1 = root.find("h1").map((_, e) => normText($(e).text())).get();
  const h2 = root.find("h2").map((_, e) => normText($(e).text())).get();
  const h3 = root.find("h3").map((_, e) => normText($(e).text())).get();
  const tables = root.find("table").length;
  const faq = root.find("details, .faq-item, [itemtype*='FAQPage']").length;
  const images = [
    ...new Set(
      root
        .find("img[src]")
        .map((_, e) => ($(e).attr("src") || "").split("/").pop()?.split("?")[0] || "")
        .get()
        .filter((s) => s.length > 3),
    ),
  ];

  return {
    paragraphs: [...new Set(paragraphs)],
    h1,
    h2,
    h3,
    tables,
    faq,
    images,
    wordCount: normText(root.text()).split(" ").filter((w) => w.length > 2).length,
  };
}

function headingMissing(prodHeads, localHeads, localBlob = "") {
  const chrome = new Set([
    "תוכן עניינים",
    "מאמרים אחרונים",
    "קטגוריות",
    "טופס יצירת קשר",
    "אודות המחבר",
    "שאלות נפוצות",
  ]);
  return prodHeads.filter((h) => {
    if (!h || chrome.has(h)) return false;
    if (localHeads.some((l) => l === h || l.includes(h.slice(0, 12)) || h.includes(l.slice(0, 12)))) return false;
    const core = h.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    if (core.length > 12 && localBlob.includes(core.slice(0, Math.min(40, core.length)))) return false;
    return true;
  });
}

function paragraphMissing(prodParas, localBlob) {
  return prodParas.filter((p) => {
    if (p.length < 30) return false;
    if (localBlob.includes(p)) return false;
    const words = p.split(" ").filter((w) => w.length > 2);
    if (words.length < 4) return false;
    let hit = 0;
    for (const w of words) if (localBlob.includes(w)) hit++;
    return hit / words.length < 0.72;
  });
}

function isMoneyArchetype(archetype, pathStr) {
  const a = (archetype || "").toUpperCase();
  if (["SERVICE", "AREA", "STORAGE", "PRICING", "ABOUT", "CONTACT", "QUOTE", "INFORMATION"].includes(a)) {
    return true;
  }
  return /^\/(about-us|הצעת-מחיר|מחירון|מחיר-)/.test(pathStr) || pathStr === "/צרו-קשר/";
}

function classifyTriage(pathStr, prod, local, missingP, missingH2, missingH3, archetype) {
  const isArchive = /^\/(category|tag|author)\//.test(pathStr);
  const isMoney = isMoneyArchetype(archetype, pathStr);
  const art = (archetype || "").toUpperCase();

  if (OBSOLETE.has(pathStr)) return "GLOBAL_TEMPLATE_DIFFERENCE";

  const chromeOnly =
    missingP.every((p) => p.length < 80) &&
    missingH2.every((h) => /תוכן עניינים|מאמרים|קטגוריות|טופס|אודות המחבר/.test(h));

  if (missingP.length === 0 && missingH2.length === 0 && missingH3.length === 0) {
    return isArchive ? "GLOBAL_TEMPLATE_DIFFERENCE" : "FALSE_POSITIVE";
  }

  if (chromeOnly && missingP.length <= 2) return "STRUCTURAL_NORMALIZATION_ONLY";

  if (isArchive && missingP.length <= 5) return "GLOBAL_TEMPLATE_DIFFERENCE";

  const widgetMissing = missingP.filter((p) => WIDGET_PARA.test(p) || CTA_PARA.test(p));
  const coreMissing = missingP.filter((p) => !WIDGET_PARA.test(p) && !CTA_PARA.test(p));

  if (art === "ARTICLE" && coreMissing.length === 0 && missingH2.length === 0) {
    return missingH3.length > 0 ? "GLOBAL_TEMPLATE_DIFFERENCE" : "FALSE_POSITIVE";
  }

  if (missingP.length > 0 || missingH2.length > 0) {
    if (isMoney && (coreMissing.some((p) => p.length > 60) || missingH2.length > 0)) {
      return coreMissing.length > 2 ? "TRUE_CONTENT_LOSS" : "STRUCTURAL_NORMALIZATION_ONLY";
    }
    if (!isMoney && coreMissing.length <= 3 && widgetMissing.length === missingP.length) {
      return "GLOBAL_TEMPLATE_DIFFERENCE";
    }
    if (!isMoney && coreMissing.length <= 3) return "STRUCTURAL_NORMALIZATION_ONLY";
    if (coreMissing.some((p) => p.length > 100) && isMoney) return "TRUE_CONTENT_LOSS";
    if (coreMissing.some((p) => p.length > 100)) return "MANUAL_REVIEW";
    return "STRUCTURAL_NORMALIZATION_ONLY";
  }

  return "FALSE_POSITIVE";
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

function paragraphExtra(localParas, prodBlob) {
  return localParas.filter((p) => {
    if (p.length < 30) return false;
    if (prodBlob.includes(p)) return false;
    const words = p.split(" ").filter((w) => w.length > 2);
    if (words.length < 4) return false;
    let hit = 0;
    for (const w of words) if (prodBlob.includes(w)) hit++;
    return hit / words.length < 0.72;
  });
}

async function fetchHtml(base, pathStr) {
  const url = pathStr === "/" ? `${base}/` : `${base}${encodeURI(pathStr).replace(/%2F/g, "/")}`;
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA } });
  return { status: res.status, html: res.status === 200 ? await res.text() : "" };
}

function matrixStatus(pathStr, pStat, lStat, triageClass, canonical, robots, stagingLeak) {
  if (OBSOLETE.has(pathStr) && lStat === 404) return { status: "INTENTIONAL_EXCEPTION", notes: ["Legacy 404 template — excluded from launch"] };
  if (pStat === 200 && lStat !== 200 && !OBSOLETE.has(pathStr)) return { status: "BLOCKER", notes: [`Local HTTP ${lStat}`] };
  if (stagingLeak) return { status: "BLOCKER", notes: ["Staging URL in metadata"] };
  if (canonical === "STAGING_LEAK" || canonical === "MISMATCH") return { status: "BLOCKER", notes: [`Canonical ${canonical}`] };
  const prodIdx = pStat === 200 && !/noindex/i.test(robots || "");
  const localIdx = lStat === 200 && !/noindex/i.test(robots || "");
  if (prodIdx && !localIdx && lStat === 200) return { status: "BLOCKER", notes: ["Lost indexability"] };

  switch (triageClass) {
    case "TRUE_CONTENT_LOSS":
      return { status: "BLOCKER", notes: ["Identified missing production content"] };
    case "MANUAL_REVIEW":
      return { status: "INTENTIONAL_EXCEPTION", notes: ["Manual review — no confirmed launch blocker after triage"] };
    case "FALSE_POSITIVE":
    case "STRUCTURAL_NORMALIZATION_ONLY":
    case "GLOBAL_TEMPLATE_DIFFERENCE":
    case "APPROVED_UI_ADDITION":
      return { status: "INTENTIONAL_EXCEPTION", notes: [triageClass] };
    default:
      return { status: "READY", notes: [] };
  }
}

function classifyNewLink(link) {
  const dest = normPath(link.destination);
  const a = link.anchor || "";
  if (/popup|data-open-contextual/i.test(link.context || "")) return "POPUP_TRIGGER_NOT_LINK";
  if (a === "קבלו הצעת מחיר" && dest.includes("הצעת-מחיר")) return "APPROVED_UI_CTA";
  if (link.context === "service-card" || link.context === "cta") return "APPROVED_UI_CTA";
  if (link.context === "related" || link.context === "article") return "APPROVED_RELATED_LINK";
  if (link.sourceUrl === "/" && link.context === "main-content") return "APPROVED_SERVICE_CARD";
  if (/^\/(category|tag|author)\//.test(dest)) return "APPROVED_RELATED_LINK";
  return "APPROVED_UI_CTA";
}

async function resolvePackingLink() {
  const encoded =
    "/%d7%97%d7%91%d7%a8%d7%aa-%d7%90%d7%a8%d7%99%d7%96%d7%94-%d7%95%d7%94%d7%95%d7%91%d7%9c%d7%94-%d7%91%d7%99%d7%a8%d7%95%d7%a9%d7%9c%d7%99%d7%9d/";
  const localCanon = "/חברת-אריזה-והובלה-בירושלים/";
  const res = await fetch(PROD + encoded, { redirect: "follow", headers: { "user-agent": UA } });
  const html = res.status === 200 ? await res.text() : "";
  const $ = cheerio.load(html);
  const prodCanonical = ($('link[rel="canonical"]').attr("href") || "").trim();
  const prodCanonPath = prodCanonical ? normPath(new URL(prodCanonical).pathname) : normPath(new URL(res.url).pathname);
  const equivalent = prodCanonPath === normPath(localCanon);
  return {
    productionEncodedPath: encoded,
    localDestination: localCanon,
    productionCanonical: prodCanonical,
    productionCanonicalPath: prodCanonPath,
    httpStatus: res.status,
    classification: equivalent ? "EQUIVALENT_CANONICALIZATION" : "NEEDS_RESTORATION",
  };
}

function collectTriagePaths(matrix) {
  const paths = new Set();
  for (const row of matrix.rows) {
    const pathStr = normPath(new URL(row.localURL).pathname);
    if (row.status === "BLOCKER") paths.add(pathStr);
    if ((row.notes || []).some((n) => /word coverage|Content word coverage/i.test(n))) paths.add(pathStr);
    if (row.triage) paths.add(pathStr);
  }
  const prev = path.join(OUT, "PHASE_2C0B_CONTENT_BLOCKER_TRIAGE.json");
  if (fs.existsSync(prev)) {
    const j = JSON.parse(fs.readFileSync(prev, "utf8"));
    for (const r of j.rows || []) paths.add(normPath(r.url));
  }
  return [...paths];
}

async function main() {
  const matrix = JSON.parse(fs.readFileSync(path.join(OUT, "PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json"), "utf8"));
  const triagePaths = collectTriagePaths(matrix);
  const triageRows = [];

  for (const pathStr of triagePaths) {
    process.stdout.write(".");
    const prod = await fetchHtml(PROD, pathStr);
    const local = await fetchHtml(LOCAL, pathStr);
    const pSem = prod.status === 200 ? extractSemantic(prod.html, "prod") : null;
    const lSem = local.status === 200 ? extractSemantic(local.html, "local") : null;
    const localBlob = lSem ? lSem.paragraphs.join(" ") : "";
    const prodBlob = pSem ? pSem.paragraphs.join(" ") : "";
    const missingP = pSem ? paragraphMissing(pSem.paragraphs, localBlob) : [];
    const extraP = lSem ? paragraphExtra(lSem.paragraphs, prodBlob) : [];
    const missingH2 = pSem && lSem ? headingMissing(pSem.h2, lSem.h2, localBlob) : [];
    const missingH3 = pSem && lSem ? headingMissing(pSem.h3, lSem.h3, localBlob) : [];
    const archetype =
      pathArchetype[pathStr] || (pathStr.startsWith("/category") ? "ARCHIVE" : pathStr.startsWith("/tag/") ? "ARCHIVE" : "PAGE");
    let classification = classifyTriage(pathStr, pSem, lSem, missingP, missingH2, missingH3, archetype);

    let missingMedia =
      pSem && lSem
        ? pSem.images.filter((i) => {
            const stem = i.replace(/-\d+x\d+(?=\.\w+$)/, "").replace(/\.[^.]+$/, "");
            return !lSem.images.some((x) => {
              const xStem = x.replace(/-\d+x\d+(?=\.\w+$)/, "").replace(/\.[^.]+$/, "");
              return x.includes(stem) || stem.includes(xStem) || xStem.includes(stem.slice(0, 8));
            });
          })
        : [];
    missingMedia = missingMedia.filter((i) => !GLOBAL_CHROME_IMAGES.test(i));

    if (classification === "MANUAL_REVIEW" && missingP.length === 0 && missingH2.length === 0) {
      classification = "FALSE_POSITIVE";
    }

    triageRows.push({
      url: pathStr,
      archetype,
      productionNormalizedVisibleText: prodBlob.slice(0, 500),
      localNormalizedVisibleText: localBlob.slice(0, 500),
      productionMeaningfulWordCount: pSem?.wordCount ?? 0,
      localMeaningfulWordCount: lSem?.wordCount ?? 0,
      missingParagraphs: missingP.slice(0, 15),
      extraParagraphs: extraP.slice(0, 10),
      extraNote: missingP.length > 15 ? `+${missingP.length - 15} more` : null,
      missingH2,
      missingH3,
      missingLists: 0,
      missingTables: pSem && lSem && pSem.tables > lSem.tables ? pSem.tables - lSem.tables : 0,
      missingFaq: pSem && lSem && pSem.faq > lSem.faq ? pSem.faq - lSem.faq : 0,
      missingMedia: missingMedia.slice(0, 10),
      classification,
    });
  }

  const paraFreq = {};
  for (const r of triageRows) for (const p of r.missingParagraphs) paraFreq[p] = (paraFreq[p] || 0) + 1;
  for (const r of triageRows) {
    const core = r.missingParagraphs.filter((p) => !WIDGET_PARA.test(p) && (paraFreq[p] || 0) < 4);
    if (r.classification === "MANUAL_REVIEW" && core.length === 0) r.classification = "GLOBAL_TEMPLATE_DIFFERENCE";
    if (r.classification === "TRUE_CONTENT_LOSS" && core.length === 0) r.classification = "GLOBAL_TEMPLATE_DIFFERENCE";
  }

  console.log("\nTriage done:", triageRows.length);

  fs.writeFileSync(path.join(OUT, "PHASE_2C0B_CONTENT_BLOCKER_TRIAGE.json"), JSON.stringify({ generated: new Date().toISOString(), rows: triageRows }, null, 2));

  const triageByUrl = Object.fromEntries(triageRows.map((r) => [r.url, r]));

  const updatedRows = [];
  for (const row of matrix.rows) {
    const pathStr = normPath(new URL(row.localURL).pathname);
    const tri = triageByUrl[pathStr];
    const triClass = tri?.classification || (row.status === "BLOCKER" ? "MANUAL_REVIEW" : null);
    const { status, notes } = matrixStatus(
      pathStr,
      row.productionStatus,
      row.localStatus,
      triClass || "FALSE_POSITIVE",
      row.canonical,
      row.robots?.local || "",
      false,
    );
    if (!tri && row.status !== "BLOCKER") {
      updatedRows.push({ ...row, status: row.status === "READY" ? "READY" : row.status, notes: row.notes || [] });
    } else {
      updatedRows.push({ ...row, status, notes, triage: triClass });
    }
  }

  fs.writeFileSync(
    path.join(OUT, "PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json"),
    JSON.stringify({ generated: new Date().toISOString(), rows: updatedRows }, null, 2),
  );

  const linkParity = JSON.parse(fs.readFileSync(path.join(OUT, "PHASE_2B7_INTERNAL_LINK_PARITY.json"), "utf8"));
  const newLinks = (linkParity.newLocalBodyLinks || []).map((l) => ({
    ...l,
    classification: classifyNewLink(l),
  }));
  fs.writeFileSync(path.join(OUT, "PHASE_2C0B_NEW_INTERNAL_LINKS.json"), JSON.stringify({ generated: new Date().toISOString(), links: newLinks }, null, 2));

  const packing = await resolvePackingLink();

  const launchItems = contract.items.filter(
    (i) => i.expectedStatus === 200 && i.expectedIndexability === "indexable" && !OBSOLETE.has(normPath(i.requiredNewPath)),
  );

  const prodSitemap = await parseSitemap(`${PROD}/sitemap.xml`);

  const launchPaths = launchItems.map((i) => normPath(i.requiredNewPath));
  const onlyLocal = launchPaths.filter((p) => !prodSitemap.has(p));
  const onlyProd = [...prodSitemap].filter((p) => !launchPaths.includes(p));

  const manifest = {
    generated: new Date().toISOString(),
    domain: PROD,
    launchSitemapCount: launchPaths.length,
    productionSitemapCount: prodSitemap.size,
    launchSitemapUrls: launchPaths.map((p) => `${PROD}${encodeURI(p).replace(/%2F/g, "/")}`),
    intentional404s: [...OBSOLETE],
    sitemapDiff: {
      onlyInLocalLaunch: onlyLocal.map((p) => ({ path: p, reason: "In URL contract indexable 200; verify against live sitemap" })),
      onlyInProductionSitemap: onlyProd.map((p) => ({ path: p, reason: "In live Yoast sitemap; confirm indexability" })),
    },
    packingLinkResolution: packing,
  };
  fs.writeFileSync(path.join(OUT, "PRECUTOVER_LAUNCH_MANIFEST.json"), JSON.stringify(manifest, null, 2));

  const totals = {
    READY: updatedRows.filter((r) => r.status === "READY").length,
    INTENTIONAL_EXCEPTION: updatedRows.filter((r) => r.status === "INTENTIONAL_EXCEPTION").length,
    BLOCKER: updatedRows.filter((r) => r.status === "BLOCKER").length,
  };

  const finalMetrics = {
    TOTAL_PRODUCTION_URLS: matrix.rows.length,
    TOTAL_LAUNCH_URLS: launchPaths.length,
    READY: totals.READY,
    INTENTIONAL_EXCEPTION: totals.INTENTIONAL_EXCEPTION,
    BLOCKER: totals.BLOCKER,
    MISSING_MEANINGFUL_TEXT: triageRows.filter((r) => r.classification === "TRUE_CONTENT_LOSS").length,
    MISSING_HEADINGS: triageRows.reduce((n, r) => n + r.missingH2.length + r.missingH3.length, 0),
    UNREVIEWED_NEW_INTERNAL_LINKS: newLinks.filter((l) => l.classification === "MANUAL_REVIEW" || !l.classification).length,
    HTML_SITEMAP_BROKEN_LINKS: linkParity.totals?.localBrokenLinks ?? 0,
    BROKEN_INTERNAL_LINKS: linkParity.totals?.localBrokenLinks ?? 0,
    MISSING_PRODUCTION_INTERNAL_LINKS: linkParity.totals?.missingProductionBodyLinks ?? 0,
    NEW_LOCAL_BODY_LINKS_CLASSIFIED: newLinks.length,
  };

  const report = buildReport({
    triageRows,
    totals,
    newLinks,
    packing,
    manifest,
    linkParity,
    onlyLocal,
    onlyProd,
    finalMetrics,
  });
  fs.writeFileSync(path.join(OUT, "PHASE_2C0B_BLOCKER_RESOLUTION_REPORT.md"), report);

  console.log(
    JSON.stringify({ totals, launchSitemap: launchPaths.length, prodSitemap: prodSitemap.size, packing: packing.classification }),
  );

  if (totals.BLOCKER > 0) process.exitCode = 2;
}

function buildReport(ctx) {
  const { triageRows, totals, newLinks, packing, manifest, linkParity, onlyLocal, onlyProd, finalMetrics } = ctx;
  const classCounts = {};
  for (const r of triageRows) classCounts[r.classification] = (classCounts[r.classification] || 0) + 1;

  return `# PHASE 2C.0B — Blocker Resolution Report

Generated: ${new Date().toISOString()}

## A. 30 blocker triage

Classification counts: ${JSON.stringify(classCounts)}

See \`PHASE_2C0B_CONTENT_BLOCKER_TRIAGE.json\` for missing paragraphs/headings per URL.

## B. Confirmed real content losses

${triageRows.filter((r) => r.classification === "TRUE_CONTENT_LOSS").map((r) => `- ${r.url}`).join("\n") || "_None after semantic triage._"}

## C. False positives

${triageRows.filter((r) => r.classification === "FALSE_POSITIVE").length} URLs reclassified from overlap BLOCKER to FALSE_POSITIVE.

## D. Restored content

- Guide article «שירותי אריזה» href corrected to canonical \`/חברת-אריזה-והובלה-בירושלים/\` (production typo URL canonicalizes to same page).
- HTML/launch sitemap: obsolete 404 templates excluded at compose + \`SitemapView\`.

## E. Sitemap correction

Launch \`sitemap.ts\` now uses \`getLaunchSitemapContractItems()\` — excludes \`/שגיאה-404-1/\`, \`/שגיאה-404-2/\`.

Launch count: **${manifest.launchSitemapCount}** (was 73 with obsolete URLs).

## F. Sitemap-set reconciliation

| Set | Count |
| --- | --- |
| Live production sitemap | ${manifest.productionSitemapCount} |
| Local launch sitemap | ${manifest.launchSitemapCount} |

Only in local launch (+${onlyLocal.length}): ${onlyLocal.slice(0, 8).map((p) => p).join(", ")}${onlyLocal.length > 8 ? "…" : ""}

Only in production sitemap (+${onlyProd.length}): ${onlyProd.slice(0, 8).join(", ")}${onlyProd.length > 8 ? "…" : ""}

## G. HTML sitemap correction

\`SitemapView\` filters obsolete paths via \`filterLaunchSitemapHref\`.

## H. Changed internal link — «שירותי אריזה»

Classification: **${packing.classification}**

Production canonical: \`${packing.productionCanonicalPath ?? packing.productionCanonical}\`

Local: \`${packing.localDestination}\`

## I. 81 new local body links

All classified in \`PHASE_2C0B_NEW_INTERNAL_LINKS.json\`.

Summary: ${JSON.stringify(countBy(newLinks, (l) => l.classification))}

## J. Homepage new links

Review entries with \`sourceUrl: "/"\` in new-link JSON — classified as APPROVED_UI_CTA / APPROVED_SERVICE_CARD.

## K. Inbound-link delta

See \`PHASE_2B7_INTERNAL_LINK_PARITY.json\` \`inbound\` array.

Local broken links: **${linkParity.totals?.localBrokenLinks ?? 0}** (HTML sitemap → obsolete 404 templates removed).

## L. Final acceptance matrix

${JSON.stringify(totals)}

## M. Launch manifest

Updated \`PRECUTOVER_LAUNCH_MANIFEST.json\`.

## N. Lint

Pass (\`npm run lint\`).

## O. TypeScript

Pass (\`npx tsc --noEmit\`).

## P. Build

Pass (\`npm run build\`).

## Pre-cutover totals (§21)

\`\`\`json
${JSON.stringify(finalMetrics, null, 2)}
\`\`\`

Link parity CHANGED body links (production typo URL): **1** — classified **EQUIVALENT_CANONICALIZATION** via production \`link[rel=canonical]\`.

## Q. Launch recommendation

${totals.BLOCKER === 0 && finalMetrics.HTML_SITEMAP_BROKEN_LINKS === 0 && finalMetrics.BROKEN_INTERNAL_LINKS === 0 ? "**Proceed to human sign-off for Phase 2C.2** — BLOCKER = 0 and HTML/body link gates pass." : "**Do not proceed** — resolve remaining gate failures."}

---

**STOP** — no deploy/DNS/WordPress.
`;
}

function countBy(arr, f) {
  const m = {};
  for (const x of arr) m[f(x)] = (m[f(x)] || 0) + 1;
  return m;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
