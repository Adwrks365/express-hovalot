import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3113";
const outDir = path.join("audit", "screenshots", "phase-2a13");

async function capture(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
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

      const truck = page.locator("#trust-truck");
      await truck.scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => {
          const img = document.querySelector("#trust-truck .trust-truck-foreground");
          return img instanceof HTMLImageElement && img.naturalWidth > 0;
        },
        { timeout: 15000 },
      );
      await capture(page, "truck-top-1440.png");

      const truckBox = await truck.boundingBox();
      if (truckBox) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, truckBox.y - 100));
        await page.waitForTimeout(300);
        await capture(page, "truck-mid-1440.png");
        await page.evaluate((y) => window.scrollTo(0, y + 200), Math.max(0, truckBox.y - 100));
        await page.waitForTimeout(300);
        await capture(page, "truck-bottom-1440.png");
      }

      results.truckOverlap = await page.evaluate(() => {
        const section = document.querySelector("#trust-truck");
        const h2 = section?.querySelector("#trust-truck-headline");
        const truck = section?.querySelector(".trust-truck-foreground");
        if (!h2 || !truck) return null;
        const hr = h2.getBoundingClientRect();
        const tr = truck.getBoundingClientRect();
        return tr.top < hr.bottom - 4;
      });

      results.truckWidthPct = await page.evaluate(() => {
        const sec = document.querySelector("#trust-truck");
        const img = sec?.querySelector(".trust-truck-foreground");
        if (!sec || !img) return 0;
        return Math.round((img.getBoundingClientRect().width / sec.getBoundingClientRect().width) * 100);
      });

      const footer = page.getByRole("contentinfo");
      await footer.scrollIntoViewIfNeeded();
      await capture(page, "footer-closed-1440.png");

      results.footerMainHeightClosed = await footer.evaluate((el) => {
        const main = el.querySelector("[data-footer-main]");
        return Math.round(main?.getBoundingClientRect().height ?? 0);
      });

      await page.locator('[aria-controls*="services-panel"]').click();
      await page.waitForTimeout(250);
      await capture(page, "footer-one-expanded-1440.png");

      results.footerAccordionExpanded = await page
        .locator('[id*="services-panel"]')
        .first()
        .getAttribute("aria-hidden");

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(outDir, "homepage-full-1440.png"), fullPage: true });

      results.heroEmailField = await page.locator('input[name="email"]').count();
      results.heroVisibleLabels = await page.evaluate(() => {
        const form = document.querySelector('[aria-label="טופס הצעת מחיר"]');
        if (!form) return -1;
        const labels = [...form.querySelectorAll("label")].filter(
          (l) => !l.classList.contains("sr-only"),
        );
        return labels.length;
      });
      results.heroSrLabels = await page.evaluate(() => {
        const form = document.querySelector('[aria-label="טופס הצעת מחיר"]');
        return form?.querySelectorAll("label.sr-only").length ?? 0;
      });
      results.heroFormHeight = await page.evaluate(() => {
        const form = document.querySelector('[aria-label="טופס הצעת מחיר"]');
        return Math.round(form?.getBoundingClientRect().height ?? 0);
      });
      results.footerMiniForm = await page.locator('[aria-label="טופס יצירת קשר בפוטר"]').count();
      results.h1 = await page.locator("h1").count();
      results.finalCta = await page.locator('[data-final-cta]').count();
    }

    if (label === "mobile-390") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await capture(page, "hero-390.png");

      await page.locator("#trust-truck").scrollIntoViewIfNeeded();
      await capture(page, "truck-390.png");

      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await capture(page, "footer-closed-390.png");

      await page.locator('[aria-controls*="services-panel"]').click();
      await page.waitForTimeout(250);
      await capture(page, "footer-one-expanded-390.png");
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
