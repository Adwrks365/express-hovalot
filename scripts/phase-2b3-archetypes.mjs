/**
 * Classify migrated pages into archetypes
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function countHeadings(html, tag) {
  const $ = cheerio.load(html || "", {}, false);
  return $(tag).length;
}

function countImages(html) {
  return (html.match(/<img\b/gi) || []).length;
}

function hasFaq(html) {
  return /שאלות\s*נפוצות|FAQ/i.test(html || "");
}

function hasTable(html) {
  return /<table\b/i.test(html || "");
}

function hasForm(html) {
  return /<form\b|wpcf7|elementor-field-group/i.test(html || "");
}

function archetypeFor(path, type, html) {
  if (path === "/blog") return "blog-archive";
  if (type === "post") return "article";
  if (path === "/about-us") return "about";
  if (path === "/הצעת-מחיר") return "quote";
  if (path === "/שאלות-נפוצות") return "faq";
  if (path === "/מחירי-הובלת-דירות") return "pricing";
  if (path === "/צרו-קשר") return "contact";
  if (path.startsWith("/הובלות-ב") && path !== "/הובלות-בירושלים") return "location";
  if (/אחסון/.test(path)) return "storage-landing";
  if (/הובל|אריזה|משטח|משרד|מוביל/.test(path)) return "service-landing";
  return "standard";
}

async function main() {
  const pages = readJson("src/content/data/pages.json");
  const posts = readJson("src/content/data/posts.json");
  const rows = [];

  for (const item of [...pages, ...posts]) {
    const html = item.contentHtml || "";
    rows.push({
      url: item.path.startsWith("/") ? item.path : `/${item.slug}`,
      wpId: item.id,
      type: item.type,
      archetype: archetypeFor(item.path, item.type, html),
      productionH1: item.title,
      h2Count: countHeadings(html, "h2"),
      h3Count: countHeadings(html, "h3"),
      imageCount: countImages(html),
      faq: hasFaq(html),
      table: hasTable(html),
      form: hasForm(html),
      recommendedRenderer:
        item.type === "post"
          ? "ArticlePageLayout"
          : "StructuredPageLayout",
    });
  }

  const summary = {};
  for (const r of rows) summary[r.archetype] = (summary[r.archetype] || 0) + 1;

  fs.writeFileSync(
    path.join(ROOT, "audit/reports/inner-page-archetypes.json"),
    JSON.stringify({ generated: new Date().toISOString(), summary, rows }, null, 2),
  );

  let md = `# Inner Page Archetypes\n\nGenerated: ${new Date().toISOString()}\n\n`;
  md += `| Archetype | Count |\n|-----------|------:|\n`;
  for (const [k, v] of Object.entries(summary).sort()) md += `| ${k} | ${v} |\n`;
  fs.writeFileSync(path.join(ROOT, "audit/reports/INNER_PAGE_ARCHETYPES.md"), md);
  console.log(JSON.stringify(summary));
}

main();
