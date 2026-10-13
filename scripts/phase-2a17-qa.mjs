import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3124";
const outDir = path.join("audit", "screenshots", "phase-2a17");

async function headerMetrics(page) {
  return page.evaluate(() => {
    const header = document.querySelector("header.sticky");
    const logo = header?.querySelector("a[aria-label*='דף הבית'] img");
    const phone = header?.querySelector("a[href^='tel:']");
    const burger = header?.querySelector("button[aria-controls='mobile-nav']");
    const hr = header?.getBoundingClientRect();
    const lr = logo?.getBoundingClientRect();
    const pr = phone?.getBoundingClientRect();
    const br = burger?.getBoundingClientRect();
    const gap = (a, b) => (a && b ? Math.round(Math.abs(a.left - b.right)) : null);
    return {
      headerHeight: hr ? Math.round(hr.height) : null,
      logoWidth: lr ? Math.round(lr.width) : null,
      phoneWidth: pr ? Math.round(pr.width) : null,
      hamburgerWidth: br ? Math.round(br.width) : null,
      phoneWrap: phone ? window.getComputedStyle(phone).whiteSpace : null,
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    };
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });

  await page.locator("[data-hero-content]").screenshot({ path: path.join(outDir, "hero-calculator-cta-1440.png") });
  await page.evaluate(() => document.querySelector('a[href="#calculator"]')?.scrollIntoView({ block: "center" }));
  await page.screenshot({ path: path.join(outDir, "calculator-cta-1440.png") });

  await page.evaluate(() => window.scrollTo(0, document.querySelector("section.bg-white")?.offsetTop || 800));
  await page.screenshot({ path: path.join(outDir, "services-1440.png") });

  await page.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outDir, "client-logos-normal-1440.png") });
  const logoImg = page.locator('[aria-labelledby="logos-heading"] img').first();
  await logoImg.hover();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outDir, "client-logos-hover-1440.png") });

  await page.getByRole("heading", { name: "מובילים בירושלים והסביבה" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outDir, "location-heading-1440.png") });

  results.heroBadgeDesktop = await page.evaluate(() => {
    const box = document.querySelector("[data-hero-content] ul li:first-child div.relative");
    return box ? Math.round(box.getBoundingClientRect().width) : null;
  });
  results.calculatorCtaHref = await page.evaluate(() => document.querySelector('a[href="#calculator"]')?.getAttribute("href"));
  results.calculatorIdCount = await page.evaluate(() => document.querySelectorAll("#calculator").length);
  results.overflow1440 = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );
  await page.screenshot({ path: path.join(outDir, "homepage-full-1440.png"), fullPage: true });
  await page.close();

  for (const w of [390, 375, 360]) {
    const m = await browser.newPage({ viewport: { width: w, height: 844 } });
    await m.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`header${w}`] = await headerMetrics(m);
    if (w === 390) {
      results.heroBadgeMobile = await m.evaluate(() => {
        const box = document.querySelector("[data-hero-content] ul li:first-child div.relative");
        return box ? Math.round(box.getBoundingClientRect().width) : null;
      });
      await m.locator("[data-hero-content] ul").screenshot({ path: path.join(outDir, "hero-icons-390.png") });
      await m.locator('a[href="#calculator"]').screenshot({ path: path.join(outDir, "calculator-cta-390.png") });
      await m.evaluate(() => window.scrollTo(0, 1200));
      await m.screenshot({ path: path.join(outDir, "services-390.png") });
      await m.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
      await m.screenshot({ path: path.join(outDir, "client-logos-390.png") });
      await m.getByRole("heading", { name: "מובילים בירושלים והסביבה" }).scrollIntoViewIfNeeded();
      await m.screenshot({ path: path.join(outDir, "location-heading-390.png") });
      await m.screenshot({ path: path.join(outDir, "homepage-full-390.png"), fullPage: true });
    }
    await m.getByRole("banner").screenshot({ path: path.join(outDir, `header-mobile-${w}.png`) });
    await m.close();
  }

  for (const w of [1024, 768]) {
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
