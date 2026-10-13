import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3126";
const outDir = path.join("audit", "screenshots", "phase-2a18");

async function overflow(page) {
  return page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );
}

async function parityCounts(page) {
  return page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    faq: document.querySelectorAll('[data-faq-item], details[data-faq], .faq-item, [id^="faq-"]').length ||
      document.querySelectorAll("details").length,
    calculator: document.querySelectorAll("#calculator").length,
    services: document.querySelectorAll('[aria-labelledby="logos-heading"]').length ? null : null,
    serviceCards: document.querySelectorAll("section.bg-white article[data-scroll-reveal], section.bg-white article").length,
    clientLogos: document.querySelectorAll('[aria-labelledby="logos-heading"] img').length,
  }));
}

async function phoneAudit(page) {
  return page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href^="tel:"]')];
    return links.map((a) => {
      const svg = a.querySelector("svg");
      const iconParent = svg?.closest("a, button") || a;
      const transform = svg ? getComputedStyle(svg).transform : null;
      const scaleX = svg?.classList.contains("-scale-x-100") || transform?.includes("matrix(-1");
      return {
        location: a.closest("header") ? "header" : a.closest("footer") ? "footer" : a.closest("[data-hero-content]") ? "hero" : a.closest("[data-fixed-controls]") ? "fixed-controls" : a.getAttribute("aria-label")?.slice(0, 40) || "other",
        href: a.getAttribute("href"),
        visible: a.textContent?.trim().replace(/\s+/g, " ") || "(icon-only)",
        mirrored: scaleX,
      };
    });
  });
}

async function serviceCardMetrics(page) {
  return page.evaluate(() => {
    const card = document.querySelector("section.bg-white article[data-scroll-reveal], section.bg-white article");
    if (!card) return null;
    const badge = card.querySelector(".relative.z-10");
    const img = card.querySelector(".aspect-\\[4\\/3\\]");
    const br = badge?.getBoundingClientRect();
    const ir = img?.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    const badgeCenter = br ? br.left + br.width / 2 : null;
    const imgCenter = ir ? ir.left + ir.width / 2 : null;
    const cardCenter = cr.left + cr.width / 2;
    return {
      badgeWidth: br ? Math.round(br.width) : null,
      badgeOffsetFromCenter: badgeCenter != null ? Math.round(badgeCenter - cardCenter) : null,
      imageWidthPct: ir && cr ? Math.round((ir.width / cr.width) * 100) : null,
      titleAlign: card.querySelector("h3") ? getComputedStyle(card.querySelector("h3")).textAlign : null,
    };
  });
}

async function footerMetrics(page) {
  return page.evaluate(() => {
    const main = document.querySelector("[data-footer-main]");
    const logo = main?.querySelector('a[aria-label*="דף הבית"] img');
    const lr = logo?.getBoundingClientRect();
    const mr = main?.getBoundingClientRect();
    return {
      logoWidth: lr ? Math.round(lr.width) : null,
      logoCenterOffset: lr && mr ? Math.round(lr.left + lr.width / 2 - (mr.left + mr.width / 2)) : null,
      mainTextAlign: main ? getComputedStyle(main).textAlign : null,
    };
  });
}

async function logoGridMetrics(page) {
  return page.evaluate(() => {
    const imgs = [...document.querySelectorAll('[aria-labelledby="logos-heading"] img')];
    const first = imgs[0]?.getBoundingClientRect();
    return {
      count: imgs.length,
      firstLogoHeight: first ? Math.round(first.height) : null,
      cellHeight: imgs[0]?.closest("li")?.querySelector("div")?.getBoundingClientRect().height
        ? Math.round(imgs[0].closest("li").querySelector("div").getBoundingClientRect().height)
        : null,
    };
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl, timestamp: new Date().toISOString() };

  // Desktop 1440
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(baseUrl, { waitUntil: "load", timeout: 90000 });
  results.parity1440 = await parityCounts(desktop);
  results.parity1440.services = await desktop.evaluate(
    () => document.querySelectorAll("section.bg-white article").length,
  );
  results.parity1440.faq = await desktop.evaluate(
    () => document.querySelectorAll('[id^="faq-"], [data-state]').length,
  );
  results.phoneIcons = await phoneAudit(desktop);
  results.overflow1440 = await overflow(desktop);

  await desktop.evaluate(() => window.scrollTo(0, 900));
  await desktop.waitForTimeout(600);
  await desktop.screenshot({ path: path.join(outDir, "services-1440.png") });

  await desktop.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: path.join(outDir, "client-logos-1440.png") });
  const logoImg = desktop.locator('[aria-labelledby="logos-heading"] img').first();
  await logoImg.hover();
  await desktop.waitForTimeout(250);
  await desktop.screenshot({ path: path.join(outDir, "client-logos-hover-1440.png") });
  results.logoGrid1440 = await logoGridMetrics(desktop);

  await desktop.evaluate(() => document.querySelector("#trust-truck")?.scrollIntoView({ block: "center" }));
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: path.join(outDir, "trust-entering-1440.png") });

  await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: path.join(outDir, "footer-1440.png") });
  results.footer1440 = await footerMetrics(desktop);
  await desktop.close();

  // 768
  const tab = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await tab.goto(baseUrl, { waitUntil: "load", timeout: 90000 });
  results.overflow768 = await overflow(tab);
  await tab.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
  await tab.screenshot({ path: path.join(outDir, "client-logos-768.png") });
  results.logoGrid768 = await logoGridMetrics(tab);
  await tab.close();

  // Mobile 390 + 360
  for (const w of [390, 360]) {
    const m = await browser.newPage({ viewport: { width: w, height: 844 } });
    await m.goto(baseUrl, { waitUntil: "load", timeout: 90000 });
    results[`overflow${w}`] = await overflow(m);

    await m.evaluate(() => window.scrollTo(0, 850));
    await m.waitForTimeout(500);
    await m.screenshot({ path: path.join(outDir, `services-${w}.png`) });
    if (w === 390) results.serviceCard390 = await serviceCardMetrics(m);

    await m.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
    await m.waitForTimeout(600);
    await m.screenshot({ path: path.join(outDir, `client-logos-${w}.png`) });
    results[`logoGrid${w}`] = await logoGridMetrics(m);

    await m.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await m.waitForTimeout(600);
    await m.screenshot({ path: path.join(outDir, `footer-${w}.png`) });
    results[`footer${w}`] = await footerMetrics(m);
    await m.close();
  }

  // Scroll reveal states at 1440
  const reveal = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reveal.goto(baseUrl, { waitUntil: "load", timeout: 90000 });
  await reveal.evaluate(() => window.scrollTo(0, 700));
  await reveal.waitForTimeout(700);
  await reveal.screenshot({ path: path.join(outDir, "reveal-services-entering-1440.png") });
  await reveal.evaluate(() => window.scrollTo(0, 2400));
  await reveal.waitForTimeout(700);
  await reveal.screenshot({ path: path.join(outDir, "reveal-about-1440.png") });
  await reveal.evaluate(() => window.scrollTo(0, 4200));
  await reveal.waitForTimeout(700);
  await reveal.screenshot({ path: path.join(outDir, "reveal-faq-calculator-1440.png") });

  // Reduced motion
  await reveal.emulateMedia({ reducedMotion: "reduce" });
  await reveal.reload({ waitUntil: "load" });
  results.reducedMotionHidden = await reveal.evaluate(() => {
    const els = [...document.querySelectorAll("[data-scroll-reveal]")];
    const hidden = els.filter((el) => getComputedStyle(el).opacity === "0").length;
    return { total: els.length, hidden };
  });
  await reveal.close();

  // 1024 overflow
  const mid = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await mid.goto(baseUrl, { waitUntil: "load", timeout: 90000 });
  results.overflow1024 = await overflow(mid);
  await mid.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
