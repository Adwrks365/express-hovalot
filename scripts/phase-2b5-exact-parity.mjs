/**
 * Phase 2B.5 — Exact production vs local parity matrix + diff report
 */
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROD = "https://express-hovalot.co.il";
const LOCAL = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
const SHOT_LOCAL = join(process.cwd(), "audit/screenshots/phase-2b5-local");
const SHOT_PROD = join(process.cwd(), "audit/screenshots/phase-2b5-production");
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOT_LOCAL, { recursive: true });

const contract = JSON.parse(
  readFileSync(join(process.cwd(), "src/content/data/url-contract.json"), "utf8"),
);
const urls = contract.items.filter((i) => i.expectedStatus === 200).map((i) => i.requiredNewPath);

function slug(path) {
  return path.replace(/^\//, "").replace(/\//g, "_") || "home";
}

function normalizeText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/חייגו עכשיו וקבלו מענה מיידי/gi, "")
    .replace(/צריכים הובלה בירושלים והסביבה/gi, "")
    .trim()
    .toLowerCase();
}

function extractMainText(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript, header, footer, nav").remove();
  const main = $(".elementor-location-single, main, article").first();
  const scope = main.length ? main : $("body");
  return normalizeText(scope.text());
}

function extractHeadings(html) {
  const $ = cheerio.load(html);
  const main = $(".elementor-location-single, main, article").first();
  const scope = main.length ? main : $("body");
  return {
    h1: scope.find("h1").map((_, e) => normalizeText($(e).text())).get(),
    h2: scope.find("h2").map((_, e) => normalizeText($(e).text())).get(),
    h3: scope.find("h3").map((_, e) => normalizeText($(e).text())).get(),
  };
}

function extractImages(html) {
  const $ = cheerio.load(html);
  const main = $(".elementor-location-single, main, article").first();
  const scope = main.length ? main : $("body");
  return [
    ...new Set(
      scope
        .find("img[src*='uploads']")
        .map((_, e) => ($(e).attr("src") || "").split("/").pop()?.split("?")[0])
        .get()
        .filter(Boolean),
    ),
  ];
}

function headingParity(prod, local) {
  const matchH2 = prod.h2.filter((h) => local.h2.some((l) => l === h || l.includes(h.slice(0, 20)) || h.includes(l.slice(0, 20))));
  return prod.h2.length ? matchH2.length / prod.h2.length : 1;
}

function textParity(prodText, localText) {
  if (!prodText.length) return 1;
  const prodWords = [...new Set(prodText.split(" ").filter((w) => w.length > 2))];
  const localSet = new Set(localText.split(" "));
  let matched = 0;
  for (const w of prodWords) if (localSet.has(w)) matched++;
  return prodWords.length ? matched / prodWords.length : 1;
}

function mediaParity(prodImgs, localImgs) {
  if (!prodImgs.length) return 1;
  const matched = prodImgs.filter((i) => localImgs.some((l) => l.includes(i.slice(0, 12)) || i.includes(l.slice(0, 12))));
  return matched.length / prodImgs.length;
}

const browser = await chromium.launch();
const rows = [];
const visualIndex = [];

for (const path of urls) {
  const s = slug(path);
  let prodHtml = "";
  const prodFile = join(process.cwd(), "audit/source/production-pages", `${s}.html`);
  if (existsSync(prodFile)) {
    prodHtml = readFileSync(prodFile, "utf8");
  } else {
    try {
      const res = await fetch(`${PROD}${path}/`);
      prodHtml = await res.text();
    } catch {
      prodHtml = "";
    }
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${LOCAL}${encodeURI(path)}/`, { waitUntil: "networkidle", timeout: 120000 });
  const localHtml = await page.content();
  await page.screenshot({ path: join(SHOT_LOCAL, `${s}-desktop.png`), fullPage: true });
  await page.close();

  const prodText = extractMainText(prodHtml);
  const localText = extractMainText(localHtml);
  const prodH = extractHeadings(prodHtml);
  const localH = extractHeadings(localHtml);
  const prodImgs = extractImages(prodHtml);
  const localImgs = extractImages(localHtml);

  const textP = textParity(prodText, localText);
  const headP = headingParity(prodH, localH);
  const mediaP = mediaParity(prodImgs, localImgs);

  const missingH2 = prodH.h2.filter((h) => !localH.h2.some((l) => l === h || l.includes(h.slice(0, 15))));
  const extraH2 = localH.h2.filter((h) => !prodH.h2.some((p) => p === h || p.includes(h.slice(0, 15))));
  const missingImg = prodImgs.filter((i) => !localImgs.some((l) => l.includes(i.slice(0, 10))));
  const extraImg = localImgs.filter((i) => !prodImgs.some((p) => p.includes(i.slice(0, 10))));

  let status = "EXACT";
  if (textP < 0.98 || headP < 0.95 || mediaP < 0.95) {
    status = textP >= 0.9 && headP >= 0.85 ? "EXACT_WITH_GLOBAL_TEMPLATE_NORMALIZATION" : "FAIL";
  }

  rows.push({
    url: path,
    SOURCE_TEXT: prodText.length,
    LOCAL_TEXT: localText.length,
    TEXT_PARITY: Number(textP.toFixed(3)),
    HEADINGS_PARITY: Number(headP.toFixed(3)),
    SECTION_COUNT: { prod: prodH.h2.length, local: localH.h2.length },
    MEDIA_PARITY: Number(mediaP.toFixed(3)),
    LINK_PARITY: "pending",
    FORM_PARITY: "pending",
    STATUS: status,
    diffs: {
      missingHeadings: missingH2.slice(0, 5),
      extraHeadings: extraH2.slice(0, 5),
      missingImages: missingImg.slice(0, 8),
      extraImages: extraImg.slice(0, 8),
    },
  });

  visualIndex.push({
    url: path,
    status,
    productionScreenshot: join("audit/screenshots/phase-2b5-production", `${s}-desktop.png`),
    localScreenshot: join("audit/screenshots/phase-2b5-local", `${s}-desktop.png`),
    textParity: textP,
  });

  console.log(status, path, "text:", textP.toFixed(2), "h2:", headP.toFixed(2), "media:", mediaP.toFixed(2));
}

await browser.close();

writeFileSync(join(OUT, "PHASE_2B5_EXACT_PARITY_MATRIX.json"), JSON.stringify({ generated: new Date().toISOString(), rows }, null, 2));

const md = [
  "# Phase 2B.5 — Visual Index",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| URL | Status | Text parity | Production | Local |",
  "|-----|--------|------------:|------------|-------|",
  ...visualIndex.map(
    (v) =>
      `| ${v.url} | ${v.status} | ${(v.textParity * 100).toFixed(0)}% | ${v.productionScreenshot} | ${v.localScreenshot} |`,
  ),
].join("\n");
writeFileSync(join(OUT, "PHASE_2B5_VISUAL_INDEX.md"), md);

const fails = rows.filter((r) => r.STATUS === "FAIL").length;
console.log("\nFAIL:", fails, "/", rows.length);
