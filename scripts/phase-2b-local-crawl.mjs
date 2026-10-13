/**
 * Crawl local Next.js site (requires: npm run build && npm run start)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.env.CRAWL_BASE || "http://localhost:3000";
const contract = JSON.parse(
  fs.readFileSync(path.join(ROOT, "audit/reports/url-contract.json"), "utf8"),
);

function normalizePath(p) {
  if (!p || p === "/") return "/";
  let out = p.startsWith("/") ? p : `/${p}`;
  if (!out.endsWith("/")) out = `${out}/`;
  return out;
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

async function fetchPage(urlPath) {
  const url = `${BASE}${urlPath === "/" ? "/" : decodePath(urlPath)}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || "";
    const desc =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ||
      "";
    const canonical =
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1] ||
      html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i)?.[1] ||
      "";
    const robots =
      html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)?.[1] || "";
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    );
    const h2Count = (html.match(/<h2/gi) || []).length;
    const internalLinks = [...html.matchAll(/href=["']([^"']+)["']/gi)]
      .map((m) => m[1])
      .filter((h) => h.startsWith("/") || h.includes("express-hovalot.co.il"));
    const externalLinks = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
      .map((m) => m[1])
      .filter((h) => !h.includes("express-hovalot.co.il") && !h.startsWith(`${BASE}`));
    const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
    const brokenImages = images.filter(
      (src) => src.includes("wp-content/uploads") && !src.startsWith("/media/"),
    );
    const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);

    return {
      url: urlPath,
      httpStatus: res.status,
      finalUrl: res.url,
      title,
      metaDescription: desc,
      canonical,
      robots,
      h1Count: h1Matches.length,
      h1Text: h1Matches[0] || "",
      h2Count,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      images: images.length,
      brokenImages: brokenImages.length,
      remoteWordPressImages: brokenImages,
      schemaTypes: [...new Set(schemaTypes)],
    };
  } catch (err) {
    return {
      url: urlPath,
      httpStatus: 0,
      error: String(err),
    };
  }
}

async function main() {
  const paths = contract.items
    .filter((item) => item.expectedStatus === 200 || item.expectedStatus === 301)
    .map((item) => normalizePath(item.requiredNewPath));

  const unique = [...new Set(paths)];
  const results = [];

  for (const p of unique) {
    results.push(await fetchPage(p));
  }

  const report = {
    generated: new Date().toISOString(),
    base: BASE,
    crawled: results.length,
    ok: results.filter((r) => r.httpStatus === 200).length,
    redirects: results.filter((r) => r.httpStatus >= 300 && r.httpStatus < 400).length,
    errors: results.filter((r) => r.httpStatus >= 400 || r.httpStatus === 0).length,
    brokenImagesTotal: results.reduce((n, r) => n + (r.brokenImages || 0), 0),
    results,
  };

  fs.writeFileSync(
    path.join(ROOT, "audit/reports/local-full-site-crawl.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({ crawled: report.crawled, ok: report.ok, errors: report.errors }));
}

main();
