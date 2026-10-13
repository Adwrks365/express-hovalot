import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.env.CRAWL_BASE || "http://localhost:3000";
const OUT = path.join(ROOT, "audit/screenshots/phase-2b2");

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: "he-IL" });

  const pm = await ctx.newPage();
  await pm.setViewportSize({ width: 390, height: 844 });
  await pm.goto(`${BASE}/מחירי-הובלת-דירות/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const tableWrap = pm.locator(".rich-text-table-wrap").first();
  if (await tableWrap.isVisible().catch(() => false)) {
    await tableWrap.scrollIntoViewIfNeeded();
    await tableWrap.screenshot({ path: path.join(OUT, "pricing-table-mobile.png") });
  }

  const sd = await ctx.newPage();
  await sd.setViewportSize({ width: 1440, height: 900 });
  await sd.goto(`${BASE}/הובלת-דירה-בירושלים/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const ctaHeading = sd.getByRole("heading", { name: "רוצים לקבל הצעת מחיר מהירה?" });
  if (await ctaHeading.isVisible().catch(() => false)) {
    await ctaHeading.scrollIntoViewIfNeeded();
    await ctaHeading.locator("xpath=ancestor::aside[1]").screenshot({
      path: path.join(OUT, "internal-cta-component.png"),
    });
  }

  const logos = sd.locator(".rich-text-logo-cluster").first();
  if ((await logos.count()) > 0) {
    await logos.scrollIntoViewIfNeeded();
    await logos.screenshot({ path: path.join(OUT, "logo-cluster-component.png") });
  }

  await browser.close();
  console.log("extra screenshots done");
}

main();
