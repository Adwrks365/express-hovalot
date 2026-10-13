/**
 * Content parity metrics — H1/H2/text/link counts (content parity, not DOM parity)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function extractMetrics(html) {
  const $ = cheerio.load(html || "");
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  return {
    h1: $("h1").map((_, el) => norm($(el).text())).get(),
    h2: $("h2").map((_, el) => norm($(el).text())).get(),
    h3: $("h3").map((_, el) => norm($(el).text())).get(),
    paragraphs: $("p").map((_, el) => norm($(el).text())).get().filter(Boolean),
    links: $("a[href]").map((_, el) => $(el).attr("href")).get(),
    images: $("img[src]").map((_, el) => $(el).attr("src")).get(),
  };
}

function compareMetrics(source, local) {
  const flags = [];
  if (source.h1.length && !local.h1.length) flags.push("MISSING_LOCAL_H1");
  if (source.h1[0] && local.h1[0] && source.h1[0] !== local.h1[0]) flags.push("HEADING_CHANGED");
  if (source.paragraphs.length > local.paragraphs.length + 5) flags.push("MISSING_LOCAL");
  if (local.paragraphs.length > source.paragraphs.length + 5) flags.push("EXTRA_LOCAL");
  if (source.images.length > local.images.length) flags.push("IMAGE_MISSING");
  return flags;
}

async function main() {
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  const crawl = fs.existsSync(path.join(ROOT, "audit/reports/local-full-site-crawl.json"))
    ? readJson("audit/reports/local-full-site-crawl.json")
    : null;

  if (!crawl) {
    console.error("Crawl data missing — run local crawl first");
    process.exit(1);
  }

  const BASE = process.env.CRAWL_BASE || "http://localhost:3000";
  const results = [];

  for (const item of [...pages, ...posts]) {
    if (item.path === "/" || item.path === "") continue;
    const pathKey = item.path.startsWith("/") ? `${item.path}/` : `/${item.path}/`;
    const res = await fetch(`${BASE}${pathKey}`);
    if (!res.ok) {
      results.push({ path: item.path, status: "FAIL", flags: ["MISSING_LOCAL"], httpStatus: res.status });
      continue;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const localParts = [];
    const heroH1 = $("main h1, .internal-page h1").first().text().trim();
    if (heroH1) localParts.push(`<h1>${heroH1}</h1>`);
    $(".rich-text, .wp-content").each((_, el) => {
      localParts.push($(el).html() || "");
    });
    const localMain = localParts.join("");
    const source = extractMetrics(item.contentHtml);
    const local = extractMetrics(localMain);
    const flags = compareMetrics(source, local);

    results.push({
      path: item.path,
      type: item.type,
      httpStatus: res.status,
      sourceH1: source.h1[0] || "",
      localH1: local.h1[0] || "",
      sourceParagraphs: source.paragraphs.length,
      localParagraphs: local.paragraphs.length,
      sourceImages: source.images.length,
      localImages: local.images.length,
      flags,
      status: flags.length ? "REVIEW" : "PASS",
    });
  }

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "PASS").length,
    review: results.filter((r) => r.status === "REVIEW").length,
    fail: results.filter((r) => r.status === "FAIL").length,
  };

  fs.writeFileSync(
    path.join(ROOT, "audit/reports/phase-2b-content-parity.json"),
    JSON.stringify({ generated: new Date().toISOString(), summary, results }, null, 2),
  );
  console.log(JSON.stringify(summary));
}

main();
