/**
 * Phase 2B.5 — Fresh production crawl: HTML snapshots, inventory, screenshots
 */
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PROD = "https://express-hovalot.co.il";
const OUT = join(process.cwd(), "audit/reports");
const SRC = join(process.cwd(), "audit/source/production-pages");
const SHOT = join(process.cwd(), "audit/screenshots/phase-2b5-production");
mkdirSync(OUT, { recursive: true });
mkdirSync(SRC, { recursive: true });
mkdirSync(SHOT, { recursive: true });

const contract = JSON.parse(
  readFileSync(join(process.cwd(), "src/content/data/url-contract.json"), "utf8"),
);
const urls = contract.items
  .filter((i) => i.expectedStatus === 200)
  .map((i) => i.requiredNewPath);

function slug(path) {
  return path.replace(/^\//, "").replace(/\//g, "_") || "home";
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractMainContent(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  const sel =
    ".elementor-location-single, main.site-main, main, article.post, .entry-content, #content";
  for (const s of sel.split(", ")) {
    const el = $(s).first();
    if (el.length && normalizeText(el.text()).length > 100) {
      return el.html() || "";
    }
  }
  return $("body").html() || "";
}

function pageInventory(html, url) {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  const main = extractMainContent(html);
  const $m = cheerio.load(`<div>${main}</div>`);
  const h1 = $("h1").map((_, e) => normalizeText($(e).text())).get();
  const h2 = $m("h2").map((_, e) => normalizeText($m(e).text())).get();
  const h3 = $m("h3").map((_, e) => normalizeText($m(e).text())).get();
  const images = $m("img[src]")
    .map((_, e) => ($m(e).attr("src") || "").split("?")[0])
    .get()
    .filter((s) => s.includes("uploads"));
  const links = $m("a[href]")
    .map((_, e) => ({
      href: $m(e).attr("href") || "",
      text: normalizeText($m(e).text()).slice(0, 120),
    }))
    .get()
    .filter((l) => l.href.startsWith("/") || l.href.includes("express-hovalot.co.il"));
  const faqCount = $m("h3, h4").filter((_, e) => /\\?|^(מה|האם|איך|מתי|למה)/.test(normalizeText($m(e).text()))).length;
  return {
    path: url,
    httpStatus: 200,
    title: normalizeText($("title").text()),
    metaDescription: $('meta[name="description"]').attr("content") || "",
    robots: $('meta[name="robots"]').attr("content") || "",
    h1,
    h2,
    h3,
    sectionCount: h2.length || 1,
    visibleTextLength: normalizeText($m.text()).length,
    imageCount: [...new Set(images)].length,
    internalLinkCount: links.length,
    formCount: $m("form, .wpcf7, input[type=tel]").length,
    faqCount,
    tableCount: $m("table").length,
    galleryVideoCount: $m("video, iframe[src*='youtube'], .gallery").length,
  };
}

function sectionInventory(html) {
  const main = extractMainContent(html);
  const $ = cheerio.load(`<div id="root">${main}</div>`, {}, false);
  const sections = [];
  let order = 0;
  let buffer = [];
  let heading = null;

  const flush = () => {
    const body = buffer.join("").trim();
    if (!body && !heading) return;
    const $b = cheerio.load(`<div>${body}</div>`, {}, false);
    const imgs = $b("img[src]")
      .map((_, e) => ($b(e).attr("src") || "").split("/").pop())
      .get();
    sections.push({
      orderIndex: order++,
      heading,
      textLength: normalizeText(body).length,
      images: imgs,
      hasForm: /form|wpcf7|input/i.test(body),
      hasFaq: /שאלות\s*נפוצות|FAQ/i.test((heading || "") + body.slice(0, 200)),
      hasTable: /<table/i.test(body),
    });
    buffer = [];
    heading = null;
  };

  const walk = (container) => {
    container.contents().each((_, node) => {
      if (node.type === "tag" && node.tagName === "h2") {
        flush();
        heading = $(node).text().replace(/\s+/g, " ").trim();
        return;
      }
      if (node.type === "tag") {
        const $n = $(node);
        if ($n.find("h2").length) {
          walk($n);
          return;
        }
      }
      const chunk = node.type === "tag" ? $.html(node) : node.type === "text" ? node.data : "";
      if (chunk?.trim()) buffer.push(chunk);
    });
  };
  walk($("#root"));
  flush();
  if (!sections.length && main.trim()) {
    sections.push({
      orderIndex: 0,
      heading: null,
      textLength: normalizeText(main).length,
      images: [],
      hasForm: false,
      hasFaq: false,
      hasTable: false,
    });
  }
  return sections;
}

const browser = await chromium.launch();
const inventory = [];
const sectionInv = {};
const mediaOwnership = [];

for (const path of urls) {
  const url = `${PROD}${path.startsWith("/") ? path : `/${path}`}/`;
  const s = slug(path);
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    const html = await page.content();
    const status = res?.status() || 0;

    writeFileSync(join(SRC, `${s}.html`), html, "utf8");
    const mainHtml = extractMainContent(html);
    writeFileSync(join(SRC, `${s}.main.html`), mainHtml, "utf8");

    await page.screenshot({ path: join(SHOT, `${s}-desktop.png`), fullPage: true });
    await page.close();

    if (status === 200) {
      const inv = pageInventory(html, path);
      inv.httpStatus = status;
      inventory.push(inv);
      sectionInv[path] = sectionInventory(html);

      const $ = cheerio.load(`<div>${mainHtml}</div>`);
      $("[src*='uploads']").each((idx, el) => {
        const src = ($(el).attr("src") || "").split("?")[0];
        if (!src) return;
        mediaOwnership.push({
          url: path,
          productionUrl: src,
          mediaKey: src.split("/").pop(),
          sectionIndex: null,
          role: "content",
          globalOrPageSpecific: "page-specific",
          allowedOnPage: true,
        });
      });
    }
    console.log("OK", path, status);
  } catch (e) {
    inventory.push({ path, httpStatus: 0, error: e.message });
    console.log("ERR", path, e.message);
  }
}

await browser.close();

writeFileSync(join(OUT, "PHASE_2B5_PRODUCTION_URL_INVENTORY.json"), JSON.stringify({ generated: new Date().toISOString(), urls: inventory }, null, 2));
writeFileSync(join(OUT, "PHASE_2B5_SECTION_INVENTORY.json"), JSON.stringify({ generated: new Date().toISOString(), sections: sectionInv }, null, 2));
writeFileSync(join(OUT, "PHASE_2B5_MEDIA_OWNERSHIP.json"), JSON.stringify({ generated: new Date().toISOString(), entries: mediaOwnership }, null, 2));
console.log("\nCaptured", inventory.length, "URLs");
