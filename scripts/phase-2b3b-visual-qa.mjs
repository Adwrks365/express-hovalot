import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/reports");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: "storage-short", path: "/אחסון-תכולה-לטווח-קצר", minText: 800 },
  { name: "contact", path: "/צרו-קשר", minText: 400 },
  { name: "faq", path: "/שאלות-נפוצות", minText: 500 },
  { name: "article-2026", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026", minText: 8000, isArticle: true },
  { name: "quote", path: "/הצעת-מחיר", minText: 400 },
];

const browser = await chromium.launch();
const results = [];

for (const p of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const urlPath = p.path.endsWith("/") ? p.path : `${p.path}/`;
  const url = `${BASE}${encodeURI(urlPath).replace(/%25/g, "%")}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1500));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const metrics = await page.evaluate(({ isArticle }) => {
    function visibleText(el) {
      if (!el) return "";
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let out = "";
      let n;
      while ((n = walker.nextNode())) {
        const t = n.textContent?.trim();
        if (!t) continue;
        let node = n.parentElement;
        let hidden = false;
        while (node) {
          const st = getComputedStyle(node);
          if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) {
            hidden = true;
            break;
          }
          if (node.hasAttribute("data-scroll-reveal") && !node.classList.contains("scroll-revealed")) {
            hidden = true;
            break;
          }
          node = node.parentElement;
        }
        if (!hidden) out += t + " ";
      }
      return out.replace(/\s+/g, " ").trim();
    }

    const main = document.querySelector("main") || document.body;
    const article = document.querySelector("article");
    const rich = document.querySelector(".rich-text-article, .rich-text-wide, .rich-text");
    const target = isArticle ? article || rich : main;

    const imgs = [...(target?.querySelectorAll("img") || [])];
    const brokenImgs = imgs.filter((img) => img.complete && img.naturalWidth === 0 && img.src && !img.src.includes("data:")).length;

    const hiddenReveals = [...document.querySelectorAll("[data-scroll-reveal]")].filter(
      (el) => !el.classList.contains("scroll-revealed") && getComputedStyle(el).opacity === "0",
    ).length;

    return {
      scrollHeight: document.documentElement.scrollHeight,
      visibleTextLen: visibleText(target),
      h2: target?.querySelectorAll("h2").length ?? 0,
      h3: target?.querySelectorAll("h3").length ?? 0,
      images: imgs.length,
      brokenImgs,
      hiddenReveals,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      mainHeight: main.getBoundingClientRect().height,
    };
  }, { isArticle: !!p.isArticle });

  const visibleChars =
    typeof metrics.visibleTextLen === "string" ? metrics.visibleTextLen.length : metrics.visibleTextLen;
  metrics.visibleTextLen = visibleChars;

  const pass =
    visibleChars >= p.minText &&
    metrics.hiddenReveals === 0 &&
    metrics.brokenImgs === 0 &&
    !metrics.overflowX;

  results.push({ ...p, ...metrics, pass });
  console.log(p.name, pass ? "PASS" : "FAIL", visibleChars, "chars", metrics.hiddenReveals ? `hidden=${metrics.hiddenReveals}` : "", metrics.brokenImgs ? `brokenImgs=${metrics.brokenImgs}` : "");
  await page.close();
}

writeFileSync(join(OUT, "phase-2b3b-visual-qa.json"), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));

await browser.close();
process.exit(results.every((r) => r.pass) ? 0 : 1);
