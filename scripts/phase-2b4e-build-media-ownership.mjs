/**
 * Build page-media-ownership.json for all content pages
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import pages from "../src/content/data/pages.json" with { type: "json" };
import { buildPageMediaOwnership } from "../src/lib/page-composition/page-media-ownership.ts";
import { mediaKeyFromSrc } from "../src/content/migration/global-media-filter.ts";
import * as cheerio from "cheerio";

const ORIGIN = "https://express-hovalot.co.il";

async function productionImageKeys(path) {
  try {
    const url = `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const keys = new Set();
    $("main img[src], .elementor img[src], article img[src], img[src]").each((_, el) => {
      const src = $(el).attr("src") || "";
      if (src.includes("uploads")) keys.add(mediaKeyFromSrc(src));
    });
    return keys;
  } catch {
    return new Set();
  }
}

const records = [];
for (const page of pages) {
  const path = page.path?.startsWith("/") ? page.path : `/${page.slug}`;
  const prodKeys = await productionImageKeys(`${path}/`);
  records.push(
    buildPageMediaOwnership(path, page.id, page.contentHtml, null, prodKeys),
  );
}

writeFileSync(
  join(process.cwd(), "audit/reports/page-media-ownership.json"),
  JSON.stringify({ generated: new Date().toISOString(), pages: records }, null, 2),
);
console.log("Wrote", records.length, "page media records");
