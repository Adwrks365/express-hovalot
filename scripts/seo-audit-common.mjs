/**
 * Shared helpers for SEO pre-fix audit (read-only, production crawl).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const PROD = process.env.AUDIT_BASE || "https://express-hovalot.co.il";
export const UA = "Mozilla/5.0 (ExpressHovalot-SEO-Audit; read-only)";
export const OUT_DIR = path.join(ROOT, "audit/reports/seo-pre-fix");

export function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

export function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

export function writeJson(name, data) {
  ensureOutDir();
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2));
}

export function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Canonical form: decoded, leading slash, trailing slash (except root). */
export function normPath(p) {
  let d = safeDecode((p || "/").split("#")[0].split("?")[0]);
  if (!d.startsWith("/")) d = `/${d}`;
  if (d !== "/" && !d.endsWith("/")) d = `${d}/`;
  return d;
}

export function pathWithoutTrailingSlash(p) {
  const n = normPath(p);
  return n === "/" ? "/" : n.slice(0, -1);
}

export function prodUrl(pathStr) {
  if (pathStr === "/") return `${PROD}/`;
  const segments = pathStr.split("/").filter(Boolean).map((s) => encodeURIComponent(safeDecode(s)));
  return `${PROD}/${segments.join("/")}/`;
}

export function prodUrlNoSlash(pathStr) {
  if (pathStr === "/") return `${PROD}`;
  const segments = pathStr.split("/").filter(Boolean).map((s) => encodeURIComponent(safeDecode(s)));
  return `${PROD}/${segments.join("/")}`;
}

export async function fetchRedirectChain(startUrl, maxHops = 10) {
  const chain = [];
  let current = startUrl;
  for (let hop = 0; hop < maxHops; hop++) {
    const res = await fetch(current, { redirect: "manual", headers: { "user-agent": UA } });
    const loc = res.headers.get("location");
    chain.push({ url: current, status: res.status, location: loc });
    if (res.status >= 300 && res.status < 400 && loc) {
      current = new URL(loc, current).href;
      continue;
    }
    const html = res.status === 200 ? await res.text() : "";
    return { finalUrl: current, chain, status: res.status, html };
  }
  return { finalUrl: current, chain, status: 0, html: "", truncated: true };
}

function parseCsvLine(line) {
  const fields = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      fields.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  fields.push(cur);
  return fields;
}

export function parsePositionCsv(csvPath) {
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.trim().split(/\r?\n/).slice(1);
  const rows = [];
  for (const line of lines) {
    const f = parseCsvLine(line);
    if (f.length < 7) continue;
    const [keyword, position, changeRaw, , volume, , urlRaw] = f;
    const url = (urlRaw || "").trim();
    const cleanUrl = url === "-" || !url ? null : url;
    let path = null;
    if (cleanUrl) {
      try {
        path = normPath(new URL(cleanUrl).pathname);
      } catch {
        path = null;
      }
    }
    rows.push({
      keyword,
      position,
      change: changeRaw === "-" ? null : Number(changeRaw),
      volume,
      url: cleanUrl,
      path,
    });
  }
  return rows;
}

export function loadWpShortlinkCandidates() {
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  const items = [];
  for (const rec of pages) {
    if (!rec.id || !rec.path) continue;
    items.push({ wpId: rec.id, expectedPath: normPath(rec.path), title: rec.title, type: "page" });
  }
  for (const rec of posts) {
    if (!rec.id || !rec.path) continue;
    items.push({ wpId: rec.id, expectedPath: normPath(rec.path), title: rec.title, type: "post" });
  }
  return items;
}

export function collectNavHrefs() {
  const navSrc = fs.readFileSync(path.join(ROOT, "src/config/navigation.ts"), "utf8");
  const hrefs = [...navSrc.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(hrefs.filter((h) => h.startsWith("/") && !h.startsWith("/#")))];
  return unique.map((h) => ({ href: h, canonical: normPath(h), source: "navigation.ts" }));
}

export function getContractPaths() {
  const contract = readJson("src/content/data/url-contract.json");
  return (contract.items || []).map((item) => ({
    path: normPath(item.requiredNewPath || new URL(item.oldUrl).pathname),
    oldUrl: item.oldUrl,
    expectedStatus: item.expectedStatus,
    expectedCanonical: item.expectedCanonical,
  }));
}

export function getAllContentPaths() {
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  return [...pages, ...posts].map((r) => ({
    path: normPath(r.path),
    title: r.title,
    seo: r.seo || {},
    id: r.id,
  }));
}

export function legacyAliases() {
  return [
    { from: "/contact-us", to: "/צרו-קשר/" },
    { from: "/contact-us/", to: "/צרו-קשר/" },
    { from: "/פתרונות-אחסנה", to: "/אחסון-תכולה-בירושלים/" },
    { from: "/פתרונות-אחסנה/", to: "/אחסון-תכולה-בירושלים/" },
  ];
}

export function defaultCsvPath() {
  const env = process.env.POSITION_CSV;
  if (env && fs.existsSync(env)) return env;
  const dl = path.join(process.env.USERPROFILE || "", "Downloads", "position-tracking-report-2026-10-12.csv");
  if (fs.existsSync(dl)) return dl;
  return path.join(ROOT, "audit/reports/position-tracking-report-2026-10-12.csv");
}
