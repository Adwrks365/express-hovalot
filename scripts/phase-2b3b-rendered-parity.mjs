import { chromium } from "playwright";
import posts from "../src/content/data/posts.json" with { type: "json" };
import pages from "../src/content/data/pages.json" with { type: "json" };
import * as cheerio from "cheerio";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";

function plain(html) {
  const $ = cheerio.load(html || "", {}, false);
  return $.root().text().replace(/\s+/g, " ").trim();
}

function normalizeHebrew(text) {
  return text.replace(/[^\u0590-\u05FF\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractSignificantWords(text, minLen = 4) {
  return [...new Set(normalizeHebrew(text).split(" ").filter((w) => w.length >= minLen))];
}

const all = [...pages, ...posts];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const rows = [];
let pass = 0;
let fail = 0;

for (const item of all) {
  const dataText = plain(item.contentHtml);
  const dataWords = extractSignificantWords(dataText);
  const encoded = encodeURIComponent(item.path.replace(/^\//, "")) + "/";
  const url = `${BASE}/${encoded}`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    const rendered = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let out = "";
      let n;
      while ((n = walker.nextNode())) {
        const t = n.textContent?.trim();
        if (!t) continue;
        let p = n.parentElement;
        let ok = true;
        while (p) {
          const st = getComputedStyle(p);
          if (st.display === "none" || Number(st.opacity) === 0) {
            ok = false;
            break;
          }
          if (p.hasAttribute("data-scroll-reveal") && !p.classList.contains("scroll-revealed")) {
            ok = false;
            break;
          }
          p = p.parentElement;
        }
        if (ok) out += t + " ";
      }
      return out.replace(/\s+/g, " ").trim();
    });

    const renderedWords = extractSignificantWords(rendered);
    const missing = dataWords.filter((w) => !renderedWords.includes(w));
    const ratio = dataWords.length ? (dataWords.length - missing.length) / dataWords.length : 1;
    const status = ratio >= 0.85 ? "PASS" : ratio >= 0.7 ? "REVIEW" : "FAIL";
    if (status === "PASS") pass++;
    else fail++;
    rows.push({
      path: item.path,
      dataChars: dataText.length,
      renderedChars: rendered.length,
      wordCoverage: Number(ratio.toFixed(3)),
      missingSample: missing.slice(0, 8),
      status,
    });
  } catch (e) {
    fail++;
    rows.push({ path: item.path, status: "FAIL", error: String(e) });
  }
}

await browser.close();

writeFileSync(
  join(process.cwd(), "audit/reports/phase-2b3b-rendered-parity.json"),
  JSON.stringify({ generated: new Date().toISOString(), pass, fail, review: rows.filter((r) => r.status === "REVIEW").length, rows }, null, 2),
);

console.log(`Rendered parity: ${pass} PASS / ${fail} non-PASS of ${rows.length}`);
