/**
 * Phase 2B.3F — Automated production vs local parity matrix for all contract URLs
 */
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PROD = "https://express-hovalot.co.il";
const LOCAL = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/reports");
const SHOT_PROD = join(process.cwd(), "audit/screenshots/full-site-production");
const SHOT_LOCAL = join(process.cwd(), "audit/screenshots/full-site-local");
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOT_PROD, { recursive: true });
mkdirSync(SHOT_LOCAL, { recursive: true });

const contract = JSON.parse(readFileSync(join(process.cwd(), "src/content/data/url-contract.json"), "utf8"));
const urls = contract.items.map((i) => i.requiredNewPath);

function slug(path) {
  return path.replace(/^\//, "").replace(/\//g, "_") || "home";
}

function normalizeText(html) {
  const $ = cheerio.load(html || "");
  $("script, style, noscript").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

function extractInventory(html, baseUrl) {
  const $ = cheerio.load(html || "");
  $("script, style, noscript").remove();
  const h1 = $("h1").map((_, el) => $(el).text().trim()).get();
  const h2 = $("h2").map((_, el) => $(el).text().trim()).get();
  const h3 = $("h3").map((_, el) => $(el).text().trim()).get();
  const paragraphs = $("p").length;
  const images = $("img")
    .map((_, el) => $(el).attr("src") || "")
    .get()
    .filter(Boolean);
  const links = $("a[href]")
    .map((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      return { href, text };
    })
    .get()
    .filter((l) => l.href.startsWith("/") || l.href.includes("express-hovalot.co.il"));
  const hasFaq = /שאלות\s*נפוצות|FAQ/i.test($.html());
  const hasForm = $("form, .wpcf7, input[type=tel]").length > 0;
  return {
    h1,
    h2,
    h3,
    paragraphs,
    images: [...new Set(images)],
    links,
    hasFaq,
    hasForm,
    textLen: normalizeText($.html()).length,
  };
}

function scoreParity(prod, local) {
  const headingMatch =
    prod.h1.filter((h) => local.h1.some((l) => l.includes(h.slice(0, 20)) || h.includes(l.slice(0, 20)))).length /
    Math.max(prod.h1.length, 1);
  const h2Match =
    prod.h2.filter((h) => local.h2.some((l) => l.slice(0, 15) === l.slice(0, 15) || l.includes(h.slice(0, 12)))).length /
    Math.max(prod.h2.length, 1);
  const mediaRatio = Math.min(local.images.length, prod.images.length) / Math.max(prod.images.length, 1);
  const contentRatio = Math.min(local.textLen, prod.textLen) / Math.max(prod.textLen, 1);

  const content = contentRatio >= 0.85 ? "PASS" : contentRatio >= 0.6 ? "MANUAL_REVIEW" : "FAIL";
  const headings = h2Match >= 0.7 ? "PASS" : h2Match >= 0.4 ? "MANUAL_REVIEW" : "FAIL";
  const media = mediaRatio >= 0.6 ? "PASS_WITH_INTENTIONAL_MODERNIZATION" : mediaRatio >= 0.3 ? "MANUAL_REVIEW" : "FAIL";
  const sections =
    prod.h2.length > 0 && local.h2.length >= prod.h2.length * 0.6
      ? "PASS_WITH_INTENTIONAL_MODERNIZATION"
      : local.h2.length >= prod.h2.length * 0.4
        ? "MANUAL_REVIEW"
        : "FAIL";

  return {
    CONTENT_PARITY: content,
    HEADING_PARITY: headings,
    MEDIA_PARITY: media,
    LINK_PARITY: "MANUAL_REVIEW",
    SECTION_PARITY: sections,
    SEO_PARITY: "MANUAL_REVIEW",
    VISUAL_LAYOUT_REVIEW: sections === "FAIL" || media === "FAIL" ? "FAIL" : "MANUAL_REVIEW",
    metrics: { headingMatch, h2Match, mediaRatio, contentRatio },
  };
}

const browser = await chromium.launch();
const rows = [];
const limit = process.env.PARITY_LIMIT ? Number(process.env.PARITY_LIMIT) : urls.length;

for (let i = 0; i < Math.min(limit, urls.length); i++) {
  const path = urls[i];
  const prodUrl = `${PROD}${encodeURI(path.endsWith("/") ? path : path + "/")}`;
  const localUrl = `${LOCAL}${encodeURI(path.endsWith("/") ? path : path + "/")}`;
  const name = slug(path);

  let prodHtml = "";
  let localHtml = "";
  let prodStatus = 0;
  let localStatus = 0;

  try {
    const prodPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const prodResp = await prodPage.goto(prodUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    prodStatus = prodResp?.status() ?? 0;
    prodHtml = await prodPage.content();
    await prodPage.screenshot({ path: join(SHOT_PROD, `${name}-desktop.png`), fullPage: true });
    await prodPage.close();
  } catch (e) {
    prodHtml = "";
  }

  try {
    const localPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const localResp = await localPage.goto(localUrl, { waitUntil: "networkidle", timeout: 90000 });
    localStatus = localResp?.status() ?? 0;
    localHtml = await localPage.content();
    await localPage.screenshot({ path: join(SHOT_LOCAL, `${name}-desktop.png`), fullPage: true });
    await localPage.close();
  } catch (e) {
    localHtml = "";
  }

  const prodInv = extractInventory(prodHtml, PROD);
  const localInv = extractInventory(localHtml, LOCAL);
  const scores = scoreParity(prodInv, localInv);

  rows.push({
    url: path,
    prodStatus,
    localStatus,
    prodH2: prodInv.h2.length,
    localH2: localInv.h2.length,
    prodImages: prodInv.images.length,
    localImages: localInv.images.length,
    ...scores,
  });

  console.log(path, scores.SECTION_PARITY, scores.CONTENT_PARITY);
}

await browser.close();

const totals = {
  Total: rows.length,
  PASS: rows.filter((r) => Object.values(r).includes("PASS")).length,
  FAIL: rows.filter(
    (r) =>
      r.CONTENT_PARITY === "FAIL" ||
      r.HEADING_PARITY === "FAIL" ||
      r.MEDIA_PARITY === "FAIL" ||
      r.SECTION_PARITY === "FAIL",
  ).length,
  MANUAL_REVIEW: rows.filter((r) => Object.values(r).includes("MANUAL_REVIEW")).length,
};

writeFileSync(join(OUT, "full-site-parity-matrix.json"), JSON.stringify({ generated: new Date().toISOString(), totals, rows }, null, 2));

const md = [
  "# Full Site Parity Matrix",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Totals",
  "",
  `- Total URLs: ${totals.Total}`,
  `- FAIL (any dimension): ${totals.FAIL}`,
  `- MANUAL_REVIEW flagged: ${totals.MANUAL_REVIEW}`,
  "",
  "## Reference Pages",
  "",
  "| URL | CONTENT | HEADINGS | MEDIA | SECTIONS | LAYOUT |",
  "|-----|---------|----------|-------|----------|--------|",
  ...rows
    .filter((r) =>
      [
        "/about-us",
        "/הובלת-דירה-בירושלים",
        "/אחסון-תכולה-לטווח-קצר",
        "/אחסון-משטחים",
        "/שאלות-נפוצות",
        "/צרו-קשר",
        "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
      ].includes(r.url),
    )
    .map(
      (r) =>
        `| ${r.url} | ${r.CONTENT_PARITY} | ${r.HEADING_PARITY} | ${r.MEDIA_PARITY} | ${r.SECTION_PARITY} | ${r.VISUAL_LAYOUT_REVIEW} |`,
    ),
  "",
  "See `full-site-parity-matrix.json` for all URLs.",
].join("\n");

writeFileSync(join(OUT, "FULL_SITE_PARITY_MATRIX.md"), md);
console.log("Wrote", rows.length, "rows");
