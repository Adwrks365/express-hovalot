/**
 * Internal link validation for migrated local site
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.env.CRAWL_BASE || "http://localhost:3000";

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

async function checkUrl(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return { status: "fragment", httpStatus: null };
  }
  if (/^https?:\/\//i.test(href) && !href.includes("express-hovalot.co.il") && !href.startsWith(BASE)) {
    return { status: "external", httpStatus: null };
  }
  let url = href;
  if (href.startsWith("/")) url = `${BASE}${href}`;
  else if (href.includes("express-hovalot.co.il")) url = href.replace("https://express-hovalot.co.il", BASE);
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.status >= 400) return { status: "broken", httpStatus: res.status };
    if (res.url !== url && res.status >= 300) return { status: "redirected", httpStatus: res.status, final: res.url };
    return { status: "ok", httpStatus: res.status };
  } catch {
    return { status: "broken", httpStatus: 0 };
  }
}

async function main() {
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  const links = new Map();

  for (const item of [...pages, ...posts]) {
    const re = /href=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(item.contentHtml || "")) !== null) {
      const href = m[1];
      if (!links.has(href)) links.set(href, { href, sources: [] });
      links.get(href).sources.push(item.path);
    }
  }

  const results = [];
  for (const [href, meta] of links) {
    const check = await checkUrl(href);
    results.push({ href, ...check, sources: meta.sources.length });
  }

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === "ok").length,
    redirected: results.filter((r) => r.status === "redirected").length,
    broken: results.filter((r) => r.status === "broken").length,
    external: results.filter((r) => r.status === "external").length,
    fragment: results.filter((r) => r.status === "fragment").length,
  };

  const out = { generated: new Date().toISOString(), summary, results };
  fs.writeFileSync(path.join(ROOT, "audit/reports/phase-2b2-internal-links.json"), JSON.stringify(out, null, 2));

  const md = `# Phase 2B.2 Internal Link Validation

Generated: ${out.generated}

| Status | Count |
|--------|------:|
| OK (200) | ${summary.ok} |
| Redirected | ${summary.redirected} |
| Broken | ${summary.broken} |
| External | ${summary.external} |
| Fragment/mailto/tel | ${summary.fragment} |
| **Total unique hrefs** | **${summary.total}** |
`;

  fs.writeFileSync(path.join(ROOT, "audit/reports/PHASE_2B2_INTERNAL_LINK_VALIDATION.md"), md);
  console.log(JSON.stringify(summary));
}

main();
