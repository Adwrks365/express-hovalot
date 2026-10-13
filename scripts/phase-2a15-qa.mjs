import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3118";
const outDir = path.join("audit", "screenshots", "phase-2a15");

async function capture(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
}

async function phoneStyles(page, hover = false) {
  const phone = page.locator('[data-hero-content] a[href^="tel:"]').first();
  if (hover) {
    await phone.hover();
    // Allow transition to finish (200ms) before reading computed styles
    await page.waitForTimeout(250);
  }
  return phone.evaluate((el) => {
    const cs = getComputedStyle(el);
    const svg = el.querySelector("svg");
    const span = el.querySelector("span");
    return {
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      borderColor: cs.borderColor,
      svgColor: svg ? getComputedStyle(svg).color : null,
      spanColor: span ? getComputedStyle(span).color : null,
    };
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });

  results.overflow1440 = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );

  await capture(page, "hero-normal-1440.png");
  await capture(page, "hero-phone-normal-1440.png");

  results.phoneNormal = await phoneStyles(page, false);
  results.phoneHover = await phoneStyles(page, true);
  await capture(page, "hero-phone-hover-1440.png");

  results.heroH1 = await page.evaluate(() => {
    const h1 = document.querySelector("[data-hero-content] h1");
    if (!h1) return null;
    const cs = getComputedStyle(h1);
    return { fontSize: cs.fontSize, fontWeight: cs.fontWeight, maxWidth: h1.getBoundingClientRect().width };
  });

  results.heroCentering = await page.evaluate(() => {
    const zone = document.querySelector("[data-hero-content]");
    if (!zone) return null;
    const zx = zone.getBoundingClientRect().left + zone.getBoundingClientRect().width / 2;
    const ids = ["h2", "h1", "p"];
    const els = [...zone.querySelectorAll("h2, h1, p, ul, div.max-w-md")].slice(0, 8);
    return els.map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, deltaFromZoneCenter: Math.round(r.left + r.width / 2 - zx) };
    });
  });

  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await capture(page, "footer-1440.png");
  await capture(page, "footer-mini-form-1440.png");

  results.footerForm = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="טופס יצירת קשר בפוטר"] .grid');
    if (!grid) return null;
    const kids = [...grid.children];
    const cs = getComputedStyle(grid);
    return {
      columns: cs.gridTemplateColumns,
      gap: cs.gap,
      height: Math.round(grid.getBoundingClientRect().height),
      widths: kids.map((k) => Math.round(k.getBoundingClientRect().width)),
    };
  });

  results.footerMoran = await page.evaluate(() =>
    document.body.innerHTML.includes("moran-art.com") ? 1 : 0,
  );
  results.footerAdwrks = await page.evaluate(() =>
    (document.body.innerHTML.match(/Adwrks 365/g) || []).length,
  );
  results.accordionClosed = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("footer button[aria-expanded]")];
    return btns.length > 0 && btns.every((b) => b.getAttribute("aria-expanded") === "false");
  });
  results.footerMainHeight = await page.evaluate(() => {
    const main = document.querySelector("[data-footer-main]");
    return Math.round(main?.getBoundingClientRect().height ?? 0);
  });

  results.h1 = await page.locator("h1").count();
  results.heroEmail = await page.locator('input[name="email"]').count();

  await page.screenshot({ path: path.join(outDir, "homepage-full-1440.png"), fullPage: true });
  await page.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  results.overflow390 = await mobile.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );

  await capture(mobile, "hero-390.png");
  await mobile.locator("[data-hero-content] ul").scrollIntoViewIfNeeded();
  await capture(mobile, "hero-icons-390.png");
  await mobile.locator("[data-hero-content] .max-w-md").last().scrollIntoViewIfNeeded();
  await capture(mobile, "hero-cta-390.png");
  await mobile.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await capture(mobile, "footer-390.png");
  await mobile.screenshot({ path: path.join(outDir, "homepage-full-390.png"), fullPage: true });

  results.mobileHeroH1 = await mobile.evaluate(() => getComputedStyle(document.querySelector("[data-hero-content] h1")).fontSize);
  results.mobileHeroBg = await mobile.evaluate(() => {
    const img = document.querySelector("section img.lg\\:hidden");
    return img?.getAttribute("src") || null;
  });
  results.footerFormMobile = await mobile.evaluate(() => {
    const grid = document.querySelector('[aria-label="טופס יצירת קשר בפוטר"] .grid');
    return grid ? getComputedStyle(grid).gridTemplateColumns : null;
  });

  await mobile.close();

  for (const w of [1024, 768, 360]) {
    const p = await browser.newPage({ viewport: { width: w, height: 768 } });
    await p.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`overflow${w}`] = await p.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );
    await p.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
