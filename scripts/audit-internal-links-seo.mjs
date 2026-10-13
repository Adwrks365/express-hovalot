/**
 * SEO audit: internal links from nav, footer config, and content HTML.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  PROD,
  writeJson,
  normPath,
  prodUrl,
  fetchRedirectChain,
  collectNavHrefs,
  readJson,
  legacyAliases,
} from "./seo-audit-common.mjs";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function extractContentLinks() {
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  const map = new Map();
  const re = /href=["']([^"']+)["']/gi;
  for (const item of [...pages, ...posts]) {
    const html = item.contentHtml || "";
    let m;
    while ((m = re.exec(html)) !== null) {
      const href = m[1];
      if (!map.has(href)) map.set(href, { href, sources: [] });
      map.get(href).sources.push({ path: item.path, type: "contentHtml" });
    }
  }
  return [...map.values()];
}

async function checkHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return { category: "skip", status: null };
  }
  if (href.includes("express-hovalot.co.il")) {
    try {
      const p = normPath(new URL(href).pathname);
      return { category: "internal_absolute", path: p, needsCheck: true };
    } catch {
      return { category: "invalid", status: null };
    }
  }
  if (href.startsWith("/")) {
    const p = normPath(href.split("#")[0].split("?")[0]);
    const noSlash = p === "/" ? "/" : p.endsWith("/") ? p.slice(0, -1) : p;
    const legacy = ["/contact-us", "/פתרונות-אחסנה"];
    return {
      category: "internal_relative",
      path: p,
      hrefRaw: href,
      missingTrailingSlash: href.startsWith("/") && href !== "/" && !href.endsWith("/") && !href.includes("?"),
      isLegacy: legacy.some((l) => href === l || href === `${l}/`),
      needsCheck: true,
    };
  }
  return { category: "external", status: null };
}

async function fetchLinkStatus(pathOrUrl) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : prodUrl(pathOrUrl);
  const r = await fetchRedirectChain(url);
  const redirects = r.chain.filter((h) => h.status >= 301 && h.status < 400);
  return {
    status: r.status,
    finalPath: normPath(new URL(r.finalUrl).pathname),
    redirectHops: redirects.length,
    chain: r.chain,
    broken: r.status === 404,
    viaRedirect: redirects.length > 0,
  };
}

async function main() {
  const generated = new Date().toISOString();
  const navLinks = collectNavHrefs();
  const contentLinks = extractContentLinks();
  const allHrefs = new Map();

  for (const n of navLinks) {
    allHrefs.set(n.href, { href: n.href, sources: [{ path: n.source, type: "nav" }] });
  }
  for (const c of contentLinks) {
    if (!allHrefs.has(c.href)) allHrefs.set(c.href, { href: c.href, sources: c.sources });
    else allHrefs.get(c.href).sources.push(...c.sources);
  }

  const checked = [];
  for (const [href, meta] of allHrefs) {
    const info = await checkHref(href);
    if (!info.needsCheck) {
      checked.push({ href, ...info, sources: meta.sources });
      continue;
    }
    const pathToCheck = info.path || href;
    const http = await fetchLinkStatus(pathToCheck);
    checked.push({
      href,
      ...info,
      http,
      issues: [
        ...(http.broken ? ["broken_404"] : []),
        ...(http.viaRedirect ? ["target_via_redirect"] : []),
        ...(info.missingTrailingSlash ? ["href_without_trailing_slash"] : []),
        ...(info.isLegacy ? ["legacy_path_in_href"] : []),
        ...(http.finalPath !== normPath(pathToCheck) && !http.broken ? ["final_path_differs"] : []),
      ],
      sources: meta.sources.slice(0, 5),
    });
    await delay(60);
  }

  const summary = {
    totalUnique: checked.length,
    broken: checked.filter((c) => c.issues?.includes("broken_404")).length,
    viaRedirect: checked.filter((c) => c.issues?.includes("target_via_redirect")).length,
    noTrailingSlash: checked.filter((c) => c.issues?.includes("href_without_trailing_slash")).length,
    legacy: checked.filter((c) => c.issues?.includes("legacy_path_in_href")).length,
  };

  writeJson("audit-internal-links-seo.json", {
    generated,
    base: PROD,
    summary,
    legacyAliases: legacyAliases(),
    results: checked.filter((c) => c.issues?.length || c.category === "internal_relative"),
  });
  console.log("audit-internal-links-seo.json written", summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
