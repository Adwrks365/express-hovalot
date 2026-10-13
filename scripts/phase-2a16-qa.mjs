import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3123";
const outDir = path.join("audit", "screenshots", "phase-2a16");

async function phoneStyles(locator, page, hover = false) {
  if (hover) {
    await locator.hover();
    await page.waitForTimeout(250);
  }
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    const svg = el.querySelector("svg");
    const span = el.querySelector("span");
    return {
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      borderColor: cs.borderColor,
      svgColor: svg ? getComputedStyle(svg).color : null,
      spanColor: span ? getComputedStyle(span).color : null,
      href: el.getAttribute("href"),
      text: span?.textContent?.trim() ?? el.textContent?.trim(),
    };
  });
}

async function truckX(page) {
  return page.evaluate(() => {
    const truck = document.querySelector("[data-truck-motion]");
    const headline = document.getElementById("trust-truck-headline");
    if (!truck || !headline) return null;
    const tr = truck.getBoundingClientRect();
    const hr = headline.getBoundingClientRect();
    const style = getComputedStyle(truck);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return {
      x: Math.round(tr.left),
      translateX: Math.round(matrix.m41),
      overlap: !(tr.right < hr.left || tr.left > hr.right || tr.bottom < hr.top || tr.top > hr.bottom),
    };
  });
}

async function scrollToSectionProgress(page, progress) {
  await page.evaluate((p) => {
    const section = document.getElementById("trust-truck");
    if (!section) return;
    const viewH = window.innerHeight;
    const entryRatio = 0.92;
    const exitRatio = -0.12;
    const startTop = viewH * entryRatio;
    const endTop = viewH * exitRatio;
    const span = startTop - endTop;
    const targetTop = startTop - p * span;
    const rect = section.getBoundingClientRect();
    const scrollY = window.scrollY + rect.top - targetTop;
    window.scrollTo(0, scrollY);
  }, progress);
  await page.waitForTimeout(150);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });

  const headerPhone = page.locator("header .hidden.xl\\:flex a[href^='tel:']").first();
  results.headerPhoneNormal = await phoneStyles(headerPhone, page, false);
  results.headerPhoneHover = await phoneStyles(headerPhone, page, true);
  const siteHeader = page.getByRole("banner");
  await siteHeader.screenshot({ path: path.join(outDir, "header-phone-normal-1440.png") });
  await headerPhone.hover();
  await page.waitForTimeout(250);
  await siteHeader.screenshot({ path: path.join(outDir, "header-phone-hover-1440.png") });
  await page.mouse.move(0, 0);

  const heroPhone = page.locator("[data-hero-content] a[href^='tel:']").first();
  results.heroPhoneNormal = await phoneStyles(heroPhone, page, false);
  results.heroPhoneHover = await phoneStyles(heroPhone, page, true);
  await page.locator("[data-hero-content]").screenshot({ path: path.join(outDir, "hero-phone-normal-1440.png") });
  await heroPhone.hover();
  await page.waitForTimeout(250);
  await page.locator("[data-hero-content]").screenshot({ path: path.join(outDir, "hero-phone-hover-1440.png") });

  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  const finalPhone = page.locator("section[aria-labelledby='final-cta-heading'] a[href^='tel:']").first();
  results.finalPhoneNormal = await phoneStyles(finalPhone, page, false);
  results.finalPhoneHover = await phoneStyles(finalPhone, page, true);

  results.overflow1440 = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );

  results.heroIcons = await page.evaluate(() => {
    const img = document.querySelector("[data-hero-content] ul li:first-child div.relative");
    const label = document.querySelector("[data-hero-content] ul li:first-child span");
    if (!img || !label) return null;
    const ir = img.getBoundingClientRect();
    const cs = getComputedStyle(label);
    return {
      iconBox: Math.round(ir.width),
      labelSize: cs.fontSize,
      labelWeight: cs.fontWeight,
    };
  });

  results.creditText = await page.evaluate(() => document.body.innerText.includes("בניית אתרים, שיווק ותחזוקה"));
  results.moran = await page.evaluate(() => (document.body.innerHTML.includes("moran-art.com") ? 1 : 0));
  results.h1 = await page.locator("h1").count();
  results.visiblePhone = await page.evaluate(() =>
    [...document.querySelectorAll("header a[href^='tel:'], [data-hero-content] a[href^='tel:']")].some((el) =>
      el.textContent?.includes("052-500-55-73"),
    ),
  );
  results.telHref = await page.evaluate(() => {
    const el = document.querySelector("[data-hero-content] a[href^='tel:']");
    return el?.getAttribute("href") ?? null;
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await scrollToSectionProgress(page, 0);
  results.truckA = await truckX(page);
  await scrollToSectionProgress(page, 0.25);
  results.truckB = await truckX(page);
  await scrollToSectionProgress(page, 0.55);
  results.truckC = await truckX(page);
  await scrollToSectionProgress(page, 1);
  results.truckD = await truckX(page);
  results.truckDelta =
    results.truckA && results.truckD ? results.truckD.translateX - results.truckA.translateX : null;
  results.truckOverlapAny = [results.truckA, results.truckB, results.truckC, results.truckD].some((t) => t?.overlap);

  await page.screenshot({ path: path.join(outDir, "homepage-full-1440.png"), fullPage: true });
  await page.close();

  for (const w of [390, 360]) {
    const mobile = await browser.newPage({ viewport: { width: w, height: 844 } });
    await mobile.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`overflow${w}`] = await mobile.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );
    results[`mobileHeader${w}`] = await mobile.evaluate((width) => {
      const header = document.querySelector("header.sticky");
      const hamburger = header?.querySelector("button[aria-controls='mobile-nav']");
      const logo = header?.querySelector("img, svg");
      const phone = header?.querySelector("a[href^='tel:']");
      const hr = hamburger?.getBoundingClientRect();
      const lr = logo?.getBoundingClientRect();
      const pr = phone?.getBoundingClientRect();
      return {
        hamburger: hr ? { w: Math.round(hr.width), h: Math.round(hr.height) } : null,
        logo: lr ? { w: Math.round(lr.width), h: Math.round(lr.height) } : null,
        phone: pr
          ? {
              w: Math.round(pr.width),
              h: Math.round(pr.height),
              showsNumber: phone?.textContent?.includes("052-500-55-73") ?? false,
            }
          : null,
      };
    }, w);
    if (w === 390) {
      await mobile.screenshot({ path: path.join(outDir, "hero-390.png") });
      await mobile.getByRole("banner").screenshot({ path: path.join(outDir, "header-390.png") });
      results.mobileHeroIcons = await mobile.evaluate(() => {
        const box = document.querySelector("[data-hero-content] ul li:first-child div.relative");
        return box ? Math.round(box.getBoundingClientRect().width) : null;
      });
    }
    if (w === 360) {
      await mobile.getByRole("banner").screenshot({ path: path.join(outDir, "header-360.png") });
    }
    await mobile.close();
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
