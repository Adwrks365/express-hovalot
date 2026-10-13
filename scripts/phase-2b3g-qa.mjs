/**
 * Phase 2B.3G — Reference page QA gate
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = join(process.cwd(), "audit/reports");
mkdirSync(OUT, { recursive: true });

const REFERENCE_PAGES = [
  { name: "about", path: "/about-us/" },
  { name: "faq", path: "/שאלות-נפוצות/", expectFaqGroups: 1 },
  { name: "contact", path: "/צרו-קשר/" },
  { name: "storage-short", path: "/אחסון-תכולה-לטווח-קצר/" },
  { name: "storage-pallets", path: "/אחסון-משטחים/" },
  { name: "moving", path: "/הובלת-דירה-בירושלים/" },
  { name: "article", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", isArticle: true },
];

const results = [];
const browser = await chromium.launch();

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.log("FAIL", name, e.message);
  }
}

for (const p of REFERENCE_PAGES) {
  await test(`${p.name}-no-broken-images`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll("img")].filter(
        (img) => img.src && !img.src.includes("data:") && img.complete && img.naturalWidth === 0,
      ).length,
    );
    await page.close();
    if (broken > 0) throw new Error(`${broken} broken images`);
  });

  await test(`${p.name}-no-horizontal-overflow`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    );
    await page.close();
    if (overflow) throw new Error("horizontal overflow");
  });

  if (p.expectFaqGroups) {
    await test(`${p.name}-single-faq`, async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle" });
      const groups = await page.locator("[data-faq-group]").count();
      await page.close();
      if (groups > p.expectFaqGroups) throw new Error(`${groups} FAQ groups`);
    });
  }

  if (p.isArticle) {
    await test(`${p.name}-toc-collapsed`, async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle" });
      const expanded = await page.getByRole("button", { name: "תוכן עניינים" }).getAttribute("aria-expanded");
      await page.close();
      if (expanded !== "false") throw new Error("TOC not collapsed");
    });
  }

  await test(`${p.name}-hero-separated`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle" });
    const ok = await page.evaluate(() => {
      const header = document.querySelector("header");
      const hero = document.querySelector("[data-page-hero]");
      if (!header || !hero) return true;
      const hb = header.getBoundingClientRect();
      const heroB = hero.getBoundingClientRect();
      return heroB.top >= hb.bottom - 2;
    });
    await page.close();
    if (!ok) throw new Error("hero overlaps header");
  });
}

// Header collision suite
const WIDTHS = [1920, 1600, 1440, 1366, 1280];
for (const width of WIDTHS) {
  await test(`header-collisions-${width}`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const audit = await page.evaluate(() => {
      const grid = document.querySelector("header .xl\\:grid");
      if (!grid || getComputedStyle(grid).display !== "grid") return { skip: true };
      const nav = document.querySelector('[aria-label="ניווט ראשי"]');
      const actions = grid.lastElementChild;
      const navEls = [...nav.querySelectorAll("a")].filter((a) => !a.closest('[role="menu"]'));
      const actEls = [...actions.querySelectorAll("a,button")];
      let hits = 0;
      for (const n of navEls) {
        const a = n.getBoundingClientRect();
        for (const c of actEls) {
          const b = c.getBoundingClientRect();
          const gap = 8;
          if (!(a.right + gap <= b.left || a.left >= b.right + gap)) hits++;
        }
      }
      return { skip: false, hits };
    });
    await page.close();
    if (!audit.skip && audit.hits > 0) throw new Error(`${audit.hits} nav/action collisions`);
  });
}

await browser.close();
const summary = { generated: new Date().toISOString(), pass: results.every((r) => r.pass), results };
writeFileSync(join(OUT, "phase-2b3g-qa.json"), JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
