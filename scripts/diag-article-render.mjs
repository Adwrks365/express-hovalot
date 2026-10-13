import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const pages = [
  "/%D7%9B%D7%9E%D7%94-%D7%A2%D7%95%D7%9C%D7%94-%D7%94%D7%95%D7%91%D7%9C%D7%AA-%D7%93%D7%99%D7%A8%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%91-2026/",
  "/%D7%94%D7%96%D7%9E%D7%9F-%D7%94%D7%9B%D7%99-%D7%98%D7%95%D7%91-%D7%9C%D7%91%D7%A6%D7%A2-%D7%94%D7%95%D7%91%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const url of pages) {
  const full = `${BASE}${url}`;
  console.log("\n===", full, "===");
  await page.goto(full, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const article = document.querySelector("article");
    const rich = document.querySelector(".rich-text-article");
    const reveal = document.querySelector(".rich-text-article")?.closest("[data-scroll-reveal]");
    const richStyle = rich ? getComputedStyle(rich) : null;
    const revealStyle = reveal ? getComputedStyle(reveal) : null;
    const richRect = rich?.getBoundingClientRect();
    const articleRect = article?.getBoundingClientRect();

    const visibleText = (el) => {
      if (!el) return "";
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let out = "";
      let n;
      while ((n = walker.nextNode())) {
        const t = n.textContent?.trim();
        if (!t) continue;
        const p = n.parentElement;
        if (!p) continue;
        const st = getComputedStyle(p);
        if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) continue;
        out += t + " ";
      }
      return out.replace(/\s+/g, " ").trim();
    };

    return {
      scrollHeight: document.documentElement.scrollHeight,
      articleHeight: articleRect?.height,
      articleWidth: articleRect?.width,
      richHeight: richRect?.height,
      richWidth: richRect?.width,
      richInnerHTMLLen: rich?.innerHTML?.length ?? 0,
      richTextLen: rich?.innerText?.length ?? 0,
      visibleTextLen: visibleText(rich).length,
      h2Count: rich?.querySelectorAll("h2").length ?? 0,
      h3Count: rich?.querySelectorAll("h3").length ?? 0,
      imgCount: rich?.querySelectorAll("img").length ?? 0,
      richOpacity: richStyle?.opacity,
      revealOpacity: revealStyle?.opacity,
      revealHasClass: reveal?.classList.contains("scroll-revealed"),
      jsScrollReveal: document.documentElement.classList.contains("js-scroll-reveal"),
      revealTransform: revealStyle?.transform,
    };
  });

  console.log(JSON.stringify(metrics, null, 2));
}

await browser.close();
