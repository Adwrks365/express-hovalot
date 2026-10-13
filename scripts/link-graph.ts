/**
 * Internal-link graph: crawls live production (read-only GET) and the local build, classifies every
 * internal link by context and reports link parity, inbound counts and orphan URLs.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/link-graph.ts [localBase] [--refresh]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

const PROD = "https://express-hovalot.co.il";
const LOCAL = process.argv.find((a) => a.startsWith("http")) || "http://localhost:3010";
const REFRESH = process.argv.includes("--refresh");
const CACHE = "tmp/prod-cache";

type Item = { requiredNewPath: string; expectedStatus: number; contentType: string };
type Bucket = "body" | "navigation" | "footer" | "breadcrumb" | "form" | "popup";

/** Production destinations that are intentionally not part of the migrated URL set. */
function intentionalExclusion(dest: string): string | null {
  if (/^\/\d{4}\/\d{2}\/\d{2}\/$/.test(dest)) return "WordPress date archive (not in URL contract)";
  if (/^\/cdn-cgi\//.test(dest)) return "Cloudflare endpoint";
  if (/^\/שגיאה-404-\d\/$/.test(dest)) return "WordPress 404-template page (excluded, returns 404 locally)";
  return null;
}
type Link = { source: string; context: string; bucket: Bucket; anchor: string; href: string; destination: string };

const contract = JSON.parse(fs.readFileSync("src/content/data/url-contract.json", "utf8")) as { items: Item[] };
const paths = [
  "/",
  ...contract.items
    .filter((i) => i.expectedStatus === 200 && i.requiredNewPath !== "/" && !intentionalExclusion(normDest(i.requiredNewPath)))
    .map((i) => i.requiredNewPath),
];
const indexable = new Set(paths.map((p) => normDest(p)));

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function normDest(p: string): string {
  const d = safeDecode(p.split("#")[0]!.split("?")[0]!);
  if (d === "" || d === "/") return "/";
  return `${d.replace(/\/+$/, "")}/`;
}

const normAnchor = (s: string) => s.replace(/[\u200b\u200e\u200f\u00a0]/g, " ").replace(/\s+/g, " ").trim();

/** Returns the internal path for an href, or null for external / non-page links. */
function internalPath(href: string | undefined, base: string): string | null {
  if (!href) return null;
  const h = href.trim();
  if (!h || h.startsWith("#") || /^(tel|mailto|javascript|whatsapp):/i.test(h)) return null;
  let url: URL;
  try {
    url = new URL(h, base);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "express-hovalot.co.il" && host !== "localhost") return null;
  if (/^\/(wp-content|wp-json|wp-admin|wp-includes|_next|media|feed)\b/.test(url.pathname) || /\.(webp|jpe?g|png|gif|svg|pdf|xml|css|js)$/i.test(url.pathname)) return null;
  if (url.pathname.includes("/feed/") || url.searchParams.has("replytocom")) return null;
  return url.pathname + url.search;
}

function prodContext($: cheerio.CheerioAPI, el: AnyNode, isPost: boolean): { bucket: Bucket; context: string } {
  const $el = $(el);
  const within = (sel: string) => $el.closest(sel).length > 0;
  if (within('[data-elementor-type="popup"]')) return { bucket: "popup", context: "popup" };
  if (within(".pojo-a11y-toolbar, #pojo-a11y-toolbar")) return { bucket: "popup", context: "accessibility-plugin" };
  if (within('[data-elementor-type="header"], header')) return { bucket: "navigation", context: "navigation" };
  if (within('[data-elementor-type="footer"], footer')) return { bucket: "footer", context: "footer" };
  if (within("form, .elementor-field-group")) return { bucket: "form", context: "form-consent" };
  if (within("#breadcrumbs, .rank-math-breadcrumb, .breadcrumb, .breadcrumbs, .yoast-breadcrumbs, nav[aria-label*='breadcrumb' i], .elementor-widget-breadcrumbs")) return { bucket: "breadcrumb", context: "breadcrumb" };
  if (within(".entry-meta, #list-items, .elementor-widget-posts, .elementor-posts-container, .elementor-widget-post-navigation, .elementor-widget-archive-posts, .related-posts, .elementor-widget-author-box, .elementor-widget-sitemap, .pagination, .nav-links")) return { bucket: "body", context: "related" };
  if (within(".elementor-widget-button")) return { bucket: "body", context: "cta" };
  if (within(".elementor-widget-image-box, .elementor-widget-icon-box, .elementor-widget-call-to-action, .elementor-widget-flip-box")) return { bucket: "body", context: "service-card" };
  if (within(".elementor-widget-sidebar, aside, .widget-area")) return { bucket: "body", context: "related" };
  return { bucket: "body", context: isPost ? "article" : "main-content" };
}

function localContext($: cheerio.CheerioAPI, el: AnyNode, isPost: boolean): { bucket: Bucket; context: string } {
  const $el = $(el);
  const within = (sel: string) => $el.closest(sel).length > 0;
  if (within("header")) return { bucket: "navigation", context: "navigation" };
  if (within("footer")) return { bucket: "footer", context: "footer" };
  if (!within("main")) return { bucket: "popup", context: "fixed-controls" };
  if (within("form")) return { bucket: "form", context: "form-consent" };
  if (within('nav[aria-label="breadcrumb"]')) return { bucket: "breadcrumb", context: "breadcrumb" };
  if (within('[data-redesign-chrome], [data-section-type="posts"], [data-section-type="archive-posts"], [data-section-type="sitemap"]')) return { bucket: "body", context: "related" };
  if (within("[data-final-conversion]")) return { bucket: "body", context: "cta" };
  if (within('[data-section-type="cta-strip"]') || $el.is('[data-cta-kind]')) return { bucket: "body", context: "cta" };
  if (within('[data-section-type^="cards"], article')) return { bucket: "body", context: isPost && within("[data-article-body]") ? "article" : "service-card" };
  return { bucket: "body", context: isPost && within("[data-article-body]") ? "article" : "main-content" };
}

async function fetchText(url: string): Promise<{ status: number; html: string }> {
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (local-migration-audit; read-only)" } });
  return { status: res.status, html: await res.text() };
}

async function prodHtml(p: string): Promise<{ status: number; html: string }> {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${crypto.createHash("md5").update(p).digest("hex")}.html`);
  if (!REFRESH && fs.existsSync(file)) return { status: 200, html: fs.readFileSync(file, "utf8") };
  const r = await fetchText(PROD + encodeURI(normDest(p)));
  if (r.status === 200) fs.writeFileSync(file, r.html, "utf8");
  return r;
}

async function statusOf(base: string, dest: string): Promise<{ status: number; location: string | null }> {
  const res = await fetch(base + encodeURI(dest), { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (local-migration-audit; read-only)" } });
  await res.arrayBuffer().catch(() => null);
  const loc = res.headers.get("location");
  return { status: res.status, location: loc ? normDest(new URL(loc, base).pathname) : null };
}

function extract(html: string, source: string, base: string, kind: "prod" | "local", isPost: boolean): Link[] {
  const $ = cheerio.load(html);
  $("script, style, noscript, template").remove();
  if (kind === "prod") $(".elementor-hidden-desktop").remove();
  const links: Link[] = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    const raw = $(el).attr("href")!;
    const ip = internalPath(raw, base);
    if (!ip) return;
    const { bucket, context } = kind === "prod" ? prodContext($, el, isPost) : localContext($, el, isPost);
    const anchor = normAnchor($(el).text()) || normAnchor($(el).attr("aria-label") || "") || normAnchor($(el).find("img").attr("alt") || "");
    const destination = normDest(ip);
    const key = `${bucket}|${context}|${destination}|${anchor}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source, context, bucket, anchor, href: raw, destination });
  });
  return links;
}

async function main() {
  const postPaths = new Set(
    (JSON.parse(fs.readFileSync("src/content/data/posts.json", "utf8")) as { path: string }[]).map((p) => normDest(p.path)),
  );
  const prodLinks: Link[] = [];
  const localLinks: Link[] = [];
  const pageStatus: Record<string, { prod: number; local: number }> = {};

  for (const p of paths) {
    const src = normDest(p);
    const isPost = postPaths.has(src);
    const prod = await prodHtml(p);
    const local = await fetchText(LOCAL + encodeURI(src));
    pageStatus[src] = { prod: prod.status, local: local.status };
    if (prod.status === 200) prodLinks.push(...extract(prod.html, src, PROD, "prod", isPost));
    if (local.status === 200) localLinks.push(...extract(local.html, src, LOCAL, "local", isPost));
    process.stdout.write(".");
  }

  const dests = [...new Set([...prodLinks, ...localLinks].map((l) => l.destination))];
  const prodStatus: Record<string, { status: number; location: string | null }> = {};
  const localStatus: Record<string, { status: number; location: string | null }> = {};
  for (const d of dests) {
    prodStatus[d] = await statusOf(PROD, d).catch(() => ({ status: 0, location: null }));
    localStatus[d] = await statusOf(LOCAL, d).catch(() => ({ status: 0, location: null }));
  }
  console.log(`\n${dests.length} unique destinations`);

  const canonicalProd = (d: string) => (prodStatus[d]?.status === 301 || prodStatus[d]?.status === 308 || prodStatus[d]?.status === 302) && prodStatus[d]!.location ? prodStatus[d]!.location! : d;

  fs.mkdirSync("audit/reports", { recursive: true });
  fs.writeFileSync(
    "audit/reports/PRODUCTION_INTERNAL_LINK_GRAPH.json",
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        production: PROD,
        pagesCrawled: paths.length,
        totals: {
          links: prodLinks.length,
          byBucket: countBy(prodLinks, (l) => l.bucket),
          byContext: countBy(prodLinks, (l) => l.context),
        },
        links: prodLinks.map((l) => ({
          sourceUrl: l.source,
          sourceSection: l.context,
          bucket: l.bucket,
          anchorText: l.anchor,
          href: l.href,
          normalizedDestination: l.destination,
          destinationStatus: prodStatus[l.destination]?.status ?? null,
          destinationRedirectsTo: prodStatus[l.destination]?.location ?? null,
          inside: l.context,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  /* ---------- parity ---------- */
  const localBy = new Map<string, Link[]>();
  for (const l of localLinks) {
    const k = `${l.source}|${l.bucket}`;
    if (!localBy.has(k)) localBy.set(k, []);
    localBy.get(k)!.push(l);
  }
  type Row = { sourceUrl: string; anchor: string; bucket: Bucket; productionContext: string; productionDestination: string; localDestination: string | null; localContext: string | null; contextMatch: boolean; status: "EXACT" | "EQUIVALENT" | "MISSING" | "CHANGED" | "BROKEN" | "EXCLUDED_INTENTIONAL"; note?: string };
  const rows: Row[] = [];
  const meaningful = prodLinks.filter((l) => l.bucket !== "popup" && l.destination !== l.source);
  for (const l of meaningful) {
    const excluded = intentionalExclusion(l.destination);
    if (excluded) {
      rows.push({ sourceUrl: l.source, anchor: l.anchor, bucket: l.bucket, productionContext: l.context, productionDestination: l.destination, localDestination: null, localContext: null, contextMatch: false, status: "EXCLUDED_INTENTIONAL", note: excluded });
      continue;
    }
    const pool = localBy.get(`${l.source}|${l.bucket}`) ?? [];
    const target = canonicalProd(l.destination);
    const sameDest = pool.filter((x) => x.destination === l.destination || x.destination === target);
    const exact = sameDest.find((x) => x.anchor === l.anchor);
    const pick = exact ?? sameDest[0];
    let status: Row["status"];
    let note: string | undefined;
    if (pick) {
      const ls = localStatus[pick.destination]?.status;
      if (ls !== 200) status = "BROKEN";
      else status = exact ? "EXACT" : "EQUIVALENT";
      if (status === "EQUIVALENT") note = `local anchor: "${pick.anchor}"`;
    } else {
      const byAnchor = pool.find((x) => x.anchor && x.anchor === l.anchor);
      if (byAnchor) {
        status = localStatus[byAnchor.destination]?.status === 200 ? "CHANGED" : "BROKEN";
        note = `same anchor now points to ${byAnchor.destination}`;
      } else {
        status = "MISSING";
        if (pageStatus[l.source]?.local !== 200) note = "source page not served locally";
      }
    }
    rows.push({
      sourceUrl: l.source,
      anchor: l.anchor,
      bucket: l.bucket,
      productionContext: l.context,
      productionDestination: l.destination,
      localDestination: pick?.destination ?? null,
      localContext: pick?.context ?? null,
      contextMatch: Boolean(pick && (pick.context === l.context || (l.bucket === "body" && pick.bucket === "body"))),
      status,
      note,
    });
  }

  const localBroken = localLinks
    .filter((l) => l.bucket !== "popup" && localStatus[l.destination]?.status !== 200)
    .map((l) => ({ sourceUrl: l.source, anchor: l.anchor, bucket: l.bucket, context: l.context, destination: l.destination, status: localStatus[l.destination]?.status, redirectsTo: localStatus[l.destination]?.location }));

  const hrefPath = (raw: string) => {
    try {
      return new URL(raw, LOCAL).pathname;
    } catch {
      return raw;
    }
  };
  const malformedLocalHrefs = localLinks
    .filter((l) => {
      const p = hrefPath(l.href);
      if (p.includes("%")) {
        try {
          decodeURIComponent(p);
        } catch {
          return true;
        }
      }
      return /\/\/|[%][^0-9a-f]/i.test(p.replace(/^\//, ""));
    })
    .map((l) => ({ sourceUrl: l.source, anchor: l.anchor, href: l.href }));
  const noTrailingSlashLocalHrefs = localLinks
    .filter((l) => l.bucket !== "popup" && !hrefPath(l.href).endsWith("/"))
    .map((l) => ({ sourceUrl: l.source, anchor: l.anchor, bucket: l.bucket, href: l.href }));

  const prodBodyPairs = new Set(meaningful.filter((l) => l.bucket === "body").map((l) => `${l.source}|${l.destination}`));
  const newLocalBody = localLinks.filter((l) => l.bucket === "body" && l.destination !== l.source && !prodBodyPairs.has(`${l.source}|${l.destination}`) && !prodBodyPairs.has(`${l.source}|${canonicalProd(l.destination)}`));

  /* ---------- inbound ---------- */
  const inbound = (links: Link[], bucket: Bucket) => {
    const m: Record<string, Set<string>> = {};
    for (const l of links) {
      if (l.bucket !== bucket || l.destination === l.source) continue;
      (m[l.destination] ??= new Set()).add(l.source);
    }
    return m;
  };
  const prodIn = inbound(prodLinks, "body");
  const localIn = inbound(localLinks, "body");
  const prodNav = inbound(prodLinks, "navigation");
  const localNav = inbound(localLinks, "navigation");
  const prodFooter = inbound(prodLinks, "footer");
  const localFooter = inbound(localLinks, "footer");
  const inboundRows = [...indexable].map((u) => ({
    url: u,
    productionBodyInbound: prodIn[u]?.size ?? 0,
    localBodyInbound: localIn[u]?.size ?? 0,
    productionNavigation: (prodNav[u]?.size ?? 0) > 0,
    localNavigation: (localNav[u]?.size ?? 0) > 0,
    productionFooter: (prodFooter[u]?.size ?? 0) > 0,
    localFooter: (localFooter[u]?.size ?? 0) > 0,
    lostBodySources: [...(prodIn[u] ?? [])].filter((s) => !(localIn[u]?.has(s))),
  }));

  const summary = {
    generated: new Date().toISOString(),
    production: PROD,
    local: LOCAL,
    totals: {
      productionLinks: prodLinks.length,
      localLinks: localLinks.length,
      productionMeaningful: meaningful.length,
      productionBody: meaningful.filter((l) => l.bucket === "body").length,
      productionNavigation: meaningful.filter((l) => l.bucket === "navigation").length,
      productionFooter: meaningful.filter((l) => l.bucket === "footer").length,
      productionBreadcrumb: meaningful.filter((l) => l.bucket === "breadcrumb").length,
      statusByBucket: Object.fromEntries(
        (["body", "navigation", "footer", "breadcrumb", "form"] as Bucket[]).map((b) => [b, countBy(rows.filter((r) => r.bucket === b), (r) => r.status)]),
      ),
      status: countBy(rows, (r) => r.status),
      localBrokenLinks: localBroken.length,
      malformedLocalHrefs: malformedLocalHrefs.length,
      noTrailingSlashLocalHrefs: noTrailingSlashLocalHrefs.length,
      newLocalBodyLinks: newLocalBody.length,
    },
    rows,
    localBroken,
    malformedLocalHrefs,
    noTrailingSlashLocalHrefs,
    newLocalBodyLinks: newLocalBody.map((l) => ({ sourceUrl: l.source, anchor: l.anchor, context: l.context, destination: l.destination })),
    inbound: inboundRows,
    pageStatus,
  };
  fs.writeFileSync("audit/reports/PHASE_2B7_INTERNAL_LINK_PARITY.json", JSON.stringify(summary, null, 2), "utf8");

  const lines = [
    JSON.stringify(summary.totals, null, 1),
    "--- non-exact rows (body/breadcrumb) ---",
    ...rows.filter((r) => r.status !== "EXACT" && r.status !== "EXCLUDED_INTENTIONAL" && (r.bucket === "body" || r.bucket === "breadcrumb" || r.bucket === "form")).map((r) => `${r.status} ${r.bucket}/${r.productionContext} ${r.sourceUrl} "${r.anchor}" -> ${r.productionDestination} ${r.note ?? ""}`),
    "--- non-exact rows (navigation/footer) ---",
    ...rows.filter((r) => r.status !== "EXACT" && r.status !== "EXCLUDED_INTENTIONAL" && (r.bucket === "navigation" || r.bucket === "footer")).map((r) => `${r.status} ${r.bucket} ${r.sourceUrl} "${r.anchor}" -> ${r.productionDestination} ${r.note ?? ""}`),
    "--- local broken ---",
    ...localBroken.map((b) => `${b.status} ${b.sourceUrl} "${b.anchor}" -> ${b.destination} ${b.redirectsTo ?? ""}`),
    "--- malformed / no-trailing-slash local hrefs ---",
    ...malformedLocalHrefs.map((m) => `MALFORMED ${m.sourceUrl} "${m.anchor}" -> ${m.href}`),
    ...noTrailingSlashLocalHrefs.slice(0, 60).map((m) => `NO_SLASH ${m.bucket} ${m.sourceUrl} "${m.anchor}" -> ${m.href}`),
    "--- inbound drops ---",
    ...inboundRows.filter((r) => r.localBodyInbound < r.productionBodyInbound).map((r) => `${r.url} prod ${r.productionBodyInbound} local ${r.localBodyInbound} lost ${r.lostBodySources.join(",")}`),
  ];
  fs.writeFileSync("tmp/link-summary.txt", lines.join("\n"), "utf8");
  console.log(JSON.stringify(summary.totals));
}

function countBy<T>(arr: T[], f: (x: T) => string) {
  const m: Record<string, number> = {};
  for (const x of arr) m[f(x)] = (m[f(x)] ?? 0) + 1;
  return m;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
