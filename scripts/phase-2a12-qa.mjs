import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3108";
const outDir = path.join("audit", "screenshots", "phase-2a12");

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
    ["tablet-1024", 1024, 768],
    ["tablet-768", 768, 1024],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });

    results[`overflow${width}`] = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );

    if (label === "desktop-1440") {
      await page.locator("#trust-truck").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => {
          const img = document.querySelector("#trust-truck .trust-truck-foreground");
          return img instanceof HTMLImageElement && img.naturalWidth > 0;
        },
        { timeout: 15000 },
      );
      await capture(page, "truck-local-1440.png");

      const footer = page.getByRole("contentinfo");
      await footer.scrollIntoViewIfNeeded();
      await capture(page, "footer-local-1440.png");

      results.footerMainHeight = await footer.evaluate((el) => {
        const main = el.querySelector("[data-footer-main]");
        return main?.getBoundingClientRect().height ?? 0;
      });

      results.truckNaturalWidth = await page
        .locator("#trust-truck .trust-truck-foreground")
        .evaluate((img) => img.naturalWidth);
      results.truckSectionHeight = await page.locator("#trust-truck").evaluate((el) => el.getBoundingClientRect().height);
      results.truckWidthPct = await page.evaluate(() => {
        const sec = document.querySelector("#trust-truck");
        const img = sec?.querySelector(".trust-truck-foreground");
        if (!sec || !img) return 0;
        return Math.round((img.getBoundingClientRect().width / sec.getBoundingClientRect().width) * 100);
      });
      results.parallaxFixed = await page.evaluate(() => {
        const sec = document.querySelector("#trust-truck");
        if (!sec) return false;
        const all = sec.querySelectorAll("*");
        for (const el of all) {
          if (getComputedStyle(el).backgroundAttachment === "fixed") return true;
        }
        return getComputedStyle(sec).backgroundAttachment === "fixed";
      });

      results.footerExternal = await footer.locator('a[href^="http"]:not([href*="express-hovalot"])').count();
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

      await page.screenshot({
        path: path.join(outDir, "homepage-local-1440.png"),
        fullPage: true,
      });
    }

    if (label === "mobile-390") {
      await page.locator("#trust-truck .trust-truck-foreground").scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await capture(page, "truck-local-390.png");
      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await capture(page, "footer-local-390.png");
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
