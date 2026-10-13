/**
 * Phase 2B.1 — authoritative site migration inventory
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const AUDIT = path.join(ROOT, "audit");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function decodePath(p) {
  try {
    return p
      .split("/")
      .map((s) => (s ? decodeURIComponent(s) : s))
      .join("/");
  } catch {
    return p;
  }
}

function normalizePath(p) {
  if (!p || p === "/") return "/";
  let out = p.startsWith("/") ? p : `/${p}`;
  out = decodePath(out).replace(/\/$/, "") || "/";
  return out;
}

function classifyMigration(item, wpLookup) {
  const p = normalizePath(item.requiredNewPath);
  if (p === "/") return "ALREADY_IMPLEMENTED";
  if (item.expectedStatus === 301) return "REDIRECT";
  if (item.contentType === "duplicate-variant") return "REDIRECT";
  if (p.includes("404-1") || p.includes("404-2")) return "MANUAL_DECISION";
  if (item.expectedIndexability?.includes("noindex")) return "EXCLUDE_NOINDEX";
  if (wpLookup.has(p)) return "MIGRATE_EXACT";
  if (item.contentType === "category" || item.contentType === "tag" || item.contentType === "author") {
    return "MIGRATE_TEMPLATE";
  }
  return "MIGRATE_EXACT";
}

function main() {
  const contract = readJson("audit/reports/url-contract.json");
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  const master = fs.existsSync(path.join(AUDIT, "reports/url-master-table.json"))
    ? readJson("audit/reports/url-master-table.json")
    : { rows: [] };
  const linkRecon = fs.existsSync(path.join(AUDIT, "links/internal-link-reconciliation.json"))
    ? readJson("audit/links/internal-link-reconciliation.json")
    : { links: [] };

  const wpLookup = new Map();
  for (const item of [...pages, ...posts]) {
    wpLookup.set(normalizePath(item.path), item);
    wpLookup.set(normalizePath(`/${item.slug}`), item);
  }

  const inbound = new Map();
  const outbound = new Map();
  for (const row of master.rows || []) {
    const p = normalizePath(row.path || row.url?.replace("https://express-hovalot.co.il", ""));
    inbound.set(p, row.internalLinksPointing || 0);
  }

  const items = contract.items.map((entry) => {
    const decodedPath = normalizePath(entry.requiredNewPath);
    const encodedPath = decodedPath
      .split("/")
      .map((s, i) => (i === 0 || !s ? s : encodeURIComponent(s)))
      .join("/");
    const wp = wpLookup.get(decodedPath);
    const migrationStatus = classifyMigration(entry, wpLookup);
    const template =
      entry.contentType === "post"
        ? "ArticlePage"
        : entry.contentType === "category" || entry.contentType === "tag" || entry.contentType === "author"
          ? "ArchivePage"
          : decodedPath === "/"
            ? "Homepage (frozen)"
            : "StandardContentPage / ServicePage / LocationPage";

    return {
      originalProductionUrl: entry.oldUrl,
      decodedPathname: decodedPath,
      encodedPathname: encodedPath,
      wordpressId: wp?.id ?? null,
      wordpressType: wp?.type ?? entry.contentType,
      classification: entry.contentType,
      sitemapStatus: entry.notes?.includes("sitemap member") ? "IN_SITEMAP" : "NOT_IN_SITEMAP",
      indexability: entry.expectedIndexability,
      canonical: entry.expectedCanonical,
      httpStatusProduction: entry.expectedStatus === 301 ? 301 : 200,
      finalProductionUrl: entry.expectedCanonical,
      requiredNextRoute: decodedPath === "/" ? "/" : `${decodedPath}/`,
      migrationStatus,
      contentSource: wp ? `src/content/data/${wp.type}s.json#${wp.id}` : entry.contentType.includes("category") || entry.contentType.includes("tag") || entry.contentType.includes("author") ? "archives-template" : "UNKNOWN",
      mediaDependencies: wp?.featuredMediaId ? [`featured:${wp.featuredMediaId}`] : [],
      internalInboundLinksCount: inbound.get(decodedPath) ?? 0,
      internalOutboundLinksCount: 0,
      seoSource: wp?.seo ? "yoast_head_json" : "url-contract",
      schemaSourceTypes: wp?.seo?.schema ? ["WebPage", "Article"] : [],
      implementationComponent: template,
      redirectRequirement: entry.redirectRequirement || "none",
      notes: entry.notes || "",
    };
  });

  const summary = {
    generated: new Date().toISOString(),
    totalUrls: items.length,
    byMigrationStatus: Object.fromEntries(
      [...new Set(items.map((i) => i.migrationStatus))].map((s) => [
        s,
        items.filter((i) => i.migrationStatus === s).length,
      ]),
    ),
    pagesInContent: pages.length,
    postsInContent: posts.length,
    sitemapMembers: items.filter((i) => i.sitemapStatus === "IN_SITEMAP").length,
  };

  const jsonOut = path.join(AUDIT, "reports/phase-2b-site-inventory.json");
  fs.writeFileSync(jsonOut, JSON.stringify({ summary, items }, null, 2));

  const md = `# Phase 2B Site Migration Inventory

Generated: ${summary.generated}

## Summary

| Metric | Count |
|--------|------:|
| URL contract entries | ${summary.totalUrls} |
| WordPress pages (content) | ${summary.pagesInContent} |
| WordPress posts (content) | ${summary.postsInContent} |
| Sitemap members | ${summary.sitemapMembers} |

## Migration status

${Object.entries(summary.byMigrationStatus)
  .map(([k, v]) => `- **${k}**: ${v}`)
  .join("\n")}

## Notes

- Homepage (\`/\`) is **ALREADY_IMPLEMENTED** (Phase 2A.20 frozen baseline).
- 404 template pages (\`שגיאה-404-1\`, \`שגיאה-404-2\`) remain **MANUAL_DECISION**.
- 3 duplicate-variant URLs are **REDIRECT** (trailing-slash canonicalization).

See \`audit/reports/phase-2b-site-inventory.json\` for the full machine-readable inventory.
`;

  fs.writeFileSync(path.join(AUDIT, "reports/PHASE_2B_SITE_INVENTORY.md"), md);
  console.log(JSON.stringify(summary));
}

main();
