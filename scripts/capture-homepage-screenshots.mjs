/**
 * Capture full-page homepage screenshots for Phase 2A.8 visual QA.
 * Usage: node scripts/capture-homepage-screenshots.mjs [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.argv[2] || "http://localhost:3000";
const outDir = path.join(process.cwd(), "audit", "screenshots", "phase-2a8");

async function main() {
  const { chromium } = await import("playwright");
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("load");
    await page.waitForTimeout(2000);

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return Math.max(0, doc.scrollWidth - doc.clientWidth);
    });

    const h1Count = await page.locator("h1").count();
    const contactHeading = await page.getByRole("heading", { name: "צרו איתנו קשר" }).count();
    const finalCta = await page.getByRole("heading", { name: "יש לכם שאלות? בואו נסגור לכם פינה!" }).count();
    const trustImg = await page.locator('section img[alt*="משאית אקספרס"]').count();

    await page.screenshot({
      path: path.join(outDir, `homepage-${vp.name}.png`),
      fullPage: true,
    });

    console.log(
      JSON.stringify({
        viewport: vp.name,
        overflow,
        h1Count,
        contactHeading,
        finalCta,
        trustImg,
        screenshot: `audit/screenshots/phase-2a8/homepage-${vp.name}.png`,
      }),
    );

    await page.close();
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
