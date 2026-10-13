import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3102";
const outDir = path.join("audit", "screenshots", "phase-2a10");

const servicePhotos = [
  "/media/2311-Small_1.webp",
  "/media/2312-Small_2.webp",
  "/media/2313-Small_3.webp",
  "/media/2597-services-4.webp",
  "/media/2561-storage-warehouse-storage-warehouse-1553550.webp",
  "/media/3995-14.webp",
];

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

    const overflow = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );

    await page.screenshot({
      path: path.join(outDir, `homepage-${label}.png`),
      fullPage: true,
    });

    if (label === "desktop-1440") {
      await page.locator("section").first().scrollIntoViewIfNeeded();
      await capture(page, "hero-desktop.png");
      await page.locator("#calculator").scrollIntoViewIfNeeded();
      await capture(page, "calculator-desktop.png");
      await page.getByRole("heading", { name: /השירותים המקצועיים/ }).scrollIntoViewIfNeeded();
      await capture(page, "services-desktop.png");
      await page.locator("#trust-truck").scrollIntoViewIfNeeded();
      await capture(page, "trust-desktop.png");
      await page.getByRole("heading", { name: "יש לכם שאלות" }).scrollIntoViewIfNeeded();
      await capture(page, "final-cta-desktop.png");

      const a11yBtn = page.locator("#accessibility-widget-button");
      await a11yBtn.scrollIntoViewIfNeeded();
      await capture(page, "accessibility-closed-desktop.png");
      await a11yBtn.click();
      await page.waitForTimeout(400);
      await capture(page, "accessibility-open-desktop.png");
      const panelOpen = await page.locator("#a11y-panel").isVisible();

      results.a11yVisible = await a11yBtn.isVisible();
      results.a11yPanelOpens = panelOpen;
      results.businessDetails = await page.getByText("משרדי אקספרס הובלות").count();
      results.finalCta = await page.getByRole("heading", { name: "יש לכם שאלות" }).count();
      results.h1 = await page.locator("h1").count();
      results.overflow1440 = overflow;

      const imgs = await page.evaluate((photos) => {
        return photos.map((src) => {
          const img = Array.from(document.querySelectorAll("img")).find(
            (el) => el.currentSrc.includes(encodeURIComponent(src.replace("/media/", ""))) || el.currentSrc.includes(src.split("/").pop()),
          );
          return { src, ok: !!img && img.naturalWidth > 0 };
        });
      }, servicePhotos);
      results.serviceImages = imgs;
      results.serviceImagesLoaded = imgs.filter((i) => i.ok).length;
    }

    if (label === "mobile-390") {
      results.overflow390 = overflow;
      const a11yBtn = page.locator("#accessibility-widget-button");
      results.a11yVisibleMobile = await a11yBtn.isVisible();
      await a11yBtn.click();
      results.a11yPanelOpensMobile = await page.locator("#a11y-panel").isVisible();
      await page.screenshot({ path: path.join(outDir, "accessibility-open-mobile.png") });
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
