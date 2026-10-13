/**
 * Phase 2B.2 visual QA screenshots (requires playwright + running server)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.env.CRAWL_BASE || "http://localhost:3000";
const OUT = path.join(ROOT, "audit/screenshots/phase-2b2");

const PAGES = [
  { name: "homepage", path: "/" },
  { name: "service-apartment", path: "/הובלת-דירה-בירושלים/" },
  { name: "services-hub", path: "/שירותי-הובלה/" },
  { name: "about", path: "/about-us/" },
  { name: "quote", path: "/הצעת-מחיר/" },
  { name: "pricing", path: "/מחירי-הובלת-דירות/" },
  { name: "blog", path: "/blog/" },
  { name: "article-1", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/" },
  { name: "article-2", path: "/מעבר-דירה-בירושלים/" },
  { name: "storage", path: "/אחסון-תכולה-בירושלים/" },
  { name: "location", path: "/הובלות-במבשרת-ציון/" },
  { name: "404", path: "/this-page-does-not-exist-xyz/" },
];

const VIEWPORTS = [
  { suffix: "desktop", width: 1440, height: 900 },
  { suffix: "mobile", width: 390, height: 844 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: "he-IL" });

  for (const vp of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const entry of PAGES) {
      const url = `${BASE}${entry.path === "/" ? "/" : entry.path}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      await page.screenshot({
        path: path.join(OUT, `${entry.name}-${vp.suffix}.png`),
        fullPage: true,
      });
    }
    await page.close();
  }

  // Nav states + component crops
  let extra = 0;

  const navPage = await context.newPage();
  await navPage.setViewportSize({ width: 1440, height: 900 });
  await navPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const servicesLink = navPage.getByRole("link", { name: "שירותי הובלה", exact: true }).first();
  if (await servicesLink.isVisible().catch(() => false)) {
    await servicesLink.hover();
    await navPage.waitForTimeout(450);
    await navPage.screenshot({ path: path.join(OUT, "nav-desktop-dropdown-open.png") });
    extra += 1;
  }

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.getByRole("button", { name: "פתיחת תפריט", exact: true }).click({ force: true });
  await mobile.waitForTimeout(350);
  await mobile.screenshot({ path: path.join(OUT, "nav-mobile-open.png"), fullPage: true });
  extra += 1;
  const submenuToggle = mobile.getByRole("button", { name: /תת-תפריט שירותי הובלה/ });
  if (await submenuToggle.isVisible().catch(() => false)) {
    await submenuToggle.click();
    await mobile.waitForTimeout(350);
    await mobile.screenshot({ path: path.join(OUT, "nav-mobile-submenu-open.png"), fullPage: true });
    extra += 1;
  }

  const pricingMobile = await context.newPage();
  await pricingMobile.setViewportSize({ width: 390, height: 844 });
  await pricingMobile.goto(`${BASE}/מחירי-הובלת-דירות/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const table = pricingMobile.locator(".rich-text table").first();
  if (await table.isVisible().catch(() => false)) {
    await table.scrollIntoViewIfNeeded();
    await pricingMobile.screenshot({ path: path.join(OUT, "pricing-table-mobile.png") });
    extra += 1;
  }

  const serviceDesktop = await context.newPage();
  await serviceDesktop.setViewportSize({ width: 1440, height: 900 });
  await serviceDesktop.goto(`${BASE}/הובלת-דירה-בירושלים/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const cta = serviceDesktop.locator(".internal-cta, .rich-text .cta-link").first();
  if (await cta.isVisible().catch(() => false)) {
    await cta.scrollIntoViewIfNeeded();
    await serviceDesktop.screenshot({ path: path.join(OUT, "internal-cta-component.png") });
    extra += 1;
  }

  const logos = serviceDesktop.locator(".logo-cluster").first();
  if (await logos.isVisible().catch(() => false)) {
    await logos.scrollIntoViewIfNeeded();
    await serviceDesktop.screenshot({ path: path.join(OUT, "logo-cluster-component.png") });
    extra += 1;
  }

  await browser.close();
  console.log(JSON.stringify({ out: OUT, count: PAGES.length * VIEWPORTS.length + extra }));
}

main();
