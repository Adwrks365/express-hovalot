import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3116";
const outDir = path.join("audit", "screenshots", "phase-2a14");

async function capture(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
}

function parseTranslateX(transform) {
  if (!transform || transform === "none") return 0;
  const m = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+)/);
  if (m) return parseFloat(m[1]);
  const m3 = transform.match(/matrix3d\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+)/);
  if (m3) return parseFloat(m3[1]);
  return 0;
}

async function truckX(page) {
  return page.evaluate(() => {
    const truck = document.querySelector("[data-truck-motion]");
    const img = document.querySelector("#trust-truck .trust-truck-foreground");
    const layer = truck?.getBoundingClientRect();
    const image = img?.getBoundingClientRect();
    const tx = truck ? getComputedStyle(truck).transform : "none";
    const parse = (t) => {
      if (!t || t === "none") return 0;
      const m = t.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+)/);
      return m ? parseFloat(m[1]) : 0;
    };
    return {
      layerLeft: layer?.left ?? 0,
      imageLeft: image?.left ?? 0,
      translateX: parse(tx),
      imageWidth: image?.width ?? 0,
    };
  });
}

async function scrollTruckToPhase(page, phase) {
  const metrics = await page.evaluate((phaseName) => {
    const section = document.getElementById("trust-truck");
    if (!section) return null;
    const viewH = window.innerHeight;
    const h = section.getBoundingClientRect().height;
    const docTop = section.getBoundingClientRect().top + window.scrollY;
    let target;
    if (phaseName === "start") target = docTop - viewH * 0.88;
    else if (phaseName === "mid") target = docTop - (viewH - h) / 2;
    else target = docTop + h - viewH * 0.15;
    return Math.max(0, target);
  }, phase);
  await page.evaluate((y) => window.scrollTo(0, y), metrics);
  await page.waitForTimeout(350);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl };

  for (const [label, width, height] of [
    ["desktop-1440", 1440, 900],
    ["mobile-390", 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });

    results[`overflow${width}`] = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );

    if (label === "desktop-1440") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await capture(page, "hero-1440.png");

      results.heroH1FontSize = await page.evaluate(() => {
        const h1 = document.querySelector("section:first-of-type h1");
        return h1 ? Math.round(parseFloat(getComputedStyle(h1).fontSize)) : 0;
      });
      results.heroContentMaxWidth = await page.evaluate(() => {
        const el = document.querySelector("[data-hero-content]");
        return Math.round(el?.getBoundingClientRect().width ?? 0);
      });
      results.heroFormHeight = await page.evaluate(() => {
        const form = document.querySelector('[aria-label="טופס הצעת מחיר"]');
        return Math.round(form?.getBoundingClientRect().height ?? 0);
      });

      const sep = page.locator("[data-reviews-truck-separator]");
      await sep.scrollIntoViewIfNeeded();
      await capture(page, "reviews-truck-transition-1440.png");
      results.separatorHeight = await sep.evaluate((el) => Math.round(el.getBoundingClientRect().height));

      await scrollTruckToPhase(page, "start");
      await capture(page, "truck-scroll-start-1440.png");
      const start = await truckX(page);

      await scrollTruckToPhase(page, "mid");
      await capture(page, "truck-scroll-mid-1440.png");
      const mid = await truckX(page);

      await scrollTruckToPhase(page, "end");
      await capture(page, "truck-scroll-end-1440.png");
      const end = await truckX(page);

      results.truckSectionHeight = await page.locator("#trust-truck").evaluate((el) => Math.round(el.getBoundingClientRect().height));
      results.truckStartX = Math.round(start.imageLeft);
      results.truckMidX = Math.round(mid.imageLeft);
      results.truckEndX = Math.round(end.imageLeft);
      results.truckStartTranslate = Math.round(start.translateX);
      results.truckMidTranslate = Math.round(mid.translateX);
      results.truckEndTranslate = Math.round(end.translateX);
      results.truckMovementDelta = Math.round(end.translateX - start.translateX);
      results.truckWidth = Math.round(end.imageWidth);

      results.truckOverlap = await page.evaluate(() => {
        const section = document.querySelector("#trust-truck");
        const h2 = section?.querySelector("#trust-truck-headline");
        const truck = section?.querySelector(".trust-truck-foreground");
        if (!h2 || !truck) return null;
        const hr = h2.getBoundingClientRect();
        const tr = truck.getBoundingClientRect();
        return tr.top < hr.bottom - 4;
      });

      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await capture(page, "footer-1440.png");

      results.footerMainHeight = await page.evaluate(() => {
        const main = document.querySelector("[data-footer-main]");
        return Math.round(main?.getBoundingClientRect().height ?? 0);
      });
      results.footerFormRow = await page.evaluate(() => {
        const form = document.querySelector('[aria-label="טופס יצירת קשר בפוטר"]');
        const grid = form?.querySelector(".grid");
        if (!grid) return null;
        const cs = getComputedStyle(grid);
        return {
          columns: cs.gridTemplateColumns,
          height: Math.round(grid.getBoundingClientRect().height),
          width: Math.round(grid.getBoundingClientRect().width),
        };
      });
      results.accordionClosed = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("footer button[aria-expanded]")];
        return btns.every((b) => b.getAttribute("aria-expanded") === "false");
      });

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(outDir, "homepage-full-1440.png"), fullPage: true });
      results.h1 = await page.locator("h1").count();
      results.heroEmail = await page.locator('input[name="email"]').count();
    }

    if (label === "mobile-390") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await capture(page, "hero-390.png");
      await page.locator("[data-reviews-truck-separator]").scrollIntoViewIfNeeded();
      await capture(page, "reviews-truck-transition-390.png");
      await page.locator("#trust-truck").scrollIntoViewIfNeeded();
      await capture(page, "truck-390.png");
      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await capture(page, "footer-390.png");
      results.footerFormMobileStack = await page.evaluate(() => {
        const grid = document.querySelector('[aria-label="טופס יצירת קשר בפוטר"] .grid');
        return grid ? getComputedStyle(grid).gridTemplateColumns : null;
      });
      await page.screenshot({ path: path.join(outDir, "homepage-full-390.png"), fullPage: true });
    }

    await page.close();
  }

  for (const w of [1024, 768]) {
    const page = await browser.newPage({ viewport: { width: w, height: 768 } });
    await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`overflow${w}`] = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
