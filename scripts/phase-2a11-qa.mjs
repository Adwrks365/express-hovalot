import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3104";
const outDir = path.join("audit", "screenshots", "phase-2a11");

async function capture(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = {};

  for (const [label, width, height] of [
    ["desktop-1440", 1440, 900],
    ["mobile-390", 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(1500);

    results[`overflow${width}`] = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );

    await page.screenshot({
      path: path.join(outDir, `homepage-${label}.png`),
      fullPage: true,
    });

    if (label === "desktop-1440") {
      await page.locator("#trust-truck").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => {
          const img = document.querySelector("#trust-truck img");
          return img instanceof HTMLImageElement && img.naturalWidth > 0;
        },
        { timeout: 15000 },
      );
      await capture(page, "truck-desktop.png");

      const siteFooter = page.getByRole("contentinfo");
      await siteFooter.scrollIntoViewIfNeeded();
      await capture(page, "footer-desktop.png");

      const extLink = siteFooter.locator('a[href*="jerusalem.muni.il"]').first();
      await extLink.hover();
      await capture(page, "footer-external-hover-desktop.png");

      await page.locator("#accessibility-widget-button").scrollIntoViewIfNeeded();
      await capture(page, "footer-fixed-controls-desktop.png");

      results.truckVisible = await page.locator("#trust-truck img").isVisible();
      results.truckNaturalWidth = await page.locator("#trust-truck img").evaluate((img) => img.naturalWidth);
      results.truckNaturalHeight = await page.locator("#trust-truck img").evaluate((img) => img.naturalHeight);
      results.truckSrc = await page.locator("#trust-truck img").evaluate((img) => img.currentSrc || img.src);
      results.parallaxFixed = await page.evaluate(() => {
        const sec = document.querySelector("#trust-truck");
        if (!sec) return false;
        const styles = getComputedStyle(sec);
        const imgs = sec.querySelectorAll("*");
        for (const el of imgs) {
          if (getComputedStyle(el).backgroundAttachment === "fixed") return true;
        }
        return styles.backgroundAttachment === "fixed";
      });
      results.trustH3 = await page.getByRole("heading", {
        name: "אקספרס הובלות - שירות מקצועי, מהיר ואמין",
      }).count();
      results.trustH2 = await page.getByRole("heading", {
        name: "הובלות בירושלים והסביבה כולל אריזה ואחסנה",
      }).count();

      results.footerAbout = await siteFooter.getByText("אודותינו").count();
      results.footerNav = await siteFooter.getByText("ניווט באתר").count();
      results.footerExternal = await siteFooter.locator('a[href^="http"]:not([href*="express-hovalot"])').count();
      results.externalBlank = await page.evaluate(() => {
        const root = document.querySelector('[role="contentinfo"]');
        const links = [...(root?.querySelectorAll("a") ?? [])].filter((a) => {
          const h = a.getAttribute("href") || "";
          return /^https?:\/\//.test(h) && !h.includes("express-hovalot.co.il");
        });
        return links.filter((a) => a.getAttribute("target") !== "_blank").length;
      });
      results.externalNofollow = await page.evaluate(() => {
        const root = document.querySelector('[role="contentinfo"]');
        const links = [...(root?.querySelectorAll("a") ?? [])].filter((a) => {
          const h = a.getAttribute("href") || "";
          return /^https?:\/\//.test(h) && !h.includes("express-hovalot.co.il");
        });
        return links.filter((a) => !(a.getAttribute("rel") || "").includes("nofollow")).length;
      });
      results.externalNoopener = await page.evaluate(() => {
        const root = document.querySelector('[role="contentinfo"]');
        const links = [...(root?.querySelectorAll("a") ?? [])].filter((a) => {
          const h = a.getAttribute("href") || "";
          return /^https?:\/\//.test(h) && !h.includes("express-hovalot.co.il");
        });
        return links.filter((a) => !(a.getAttribute("rel") || "").includes("noopener")).length;
      });
      results.externalNoreferrer = await page.evaluate(() => {
        const root = document.querySelector('[role="contentinfo"]');
        const links = [...(root?.querySelectorAll("a") ?? [])].filter((a) => {
          const h = a.getAttribute("href") || "";
          return /^https?:\/\//.test(h) && !h.includes("express-hovalot.co.il");
        });
        return links.filter((a) => !(a.getAttribute("rel") || "").includes("noreferrer")).length;
      });
      results.internalNofollow = await page.evaluate(() => {
        const root = document.querySelector('[role="contentinfo"]');
        const links = [...(root?.querySelectorAll("a") ?? [])].filter((a) => {
          const h = a.getAttribute("href") || "";
          return !/^https?:\/\//.test(h) || h.includes("express-hovalot.co.il");
        });
        return links.filter((a) => (a.getAttribute("rel") || "").includes("nofollow")).length;
      });

      results.h1 = await page.locator("h1").count();
      results.finalCta = await page.getByRole("heading", { name: "יש לכם שאלות" }).count();
      results.businessDetails = await page.getByText("משרדי אקספרס הובלות").count();
    }

    if (label === "mobile-390") {
      await page.locator("#trust-truck").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => {
          const img = document.querySelector("#trust-truck img");
          return img instanceof HTMLImageElement && img.naturalWidth > 0;
        },
        { timeout: 15000 },
      );
      await capture(page, "truck-mobile.png");
      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await capture(page, "footer-mobile.png");
    }

    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
