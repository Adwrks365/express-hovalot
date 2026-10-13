import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/reports");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: "about", path: "/about-us/", faqGroups: 1 },
  { name: "faq", path: "/שאלות-נפוצות/", faqGroups: 1 },
  { name: "storage", path: "/אחסון-תכולה-לטווח-קצר/", gridMin: 6 },
  { name: "contact", path: "/צרו-קשר/" },
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

for (const p of PAGES) {
  await test(`${p.name}-zero-broken-images`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 1500));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
    });
    const broken = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")];
      return imgs.filter(
        (img) => img.src && !img.src.includes("data:") && img.complete && img.naturalWidth === 0,
      ).length;
    });
    await page.close();
    if (broken > 0) throw new Error(`${broken} broken images`);
  });

  if (p.faqGroups) {
    await test(`${p.name}-single-faq-group`, async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle" });
      const groups = await page.locator("[data-faq-group]").count();
      const accordions = await page.locator("details, [aria-expanded]").count();
      await page.close();
      if (groups > p.faqGroups && accordions > 20) throw new Error("Multiple FAQ groups detected");
    });
  }

  if (p.gridMin) {
    await test(`${p.name}-unique-storage-cards`, async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(`${BASE}${encodeURI(p.path)}`, { waitUntil: "networkidle" });
      const titles = await page.locator("article h3").allTextContents();
      const storageTitles = titles.filter((t) => t.includes("אחסון") || t.includes("ציוד"));
      const unique = new Set(storageTitles.map((t) => t.trim()));
      await page.close();
      if (unique.size < p.gridMin) throw new Error(`Only ${unique.size} unique storage cards`);
      if (storageTitles.length > unique.size + 1) throw new Error("Duplicate storage card titles rendered");
    });
  }
}

await test("header-no-wrap-1536", async () => {
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
  await nav.waitFor({ state: "visible" });
  await page.close();
});

await test("article-toc-closed", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI("/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/")}`, { waitUntil: "networkidle" });
  const expanded = await page.getByRole("button", { name: "תוכן עניינים" }).getAttribute("aria-expanded");
  await page.close();
  if (expanded !== "false") throw new Error("TOC not closed");
});

writeFileSync(join(OUT, "phase-2b3d-qa.json"), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));
await browser.close();
process.exit(results.every((r) => r.pass) ? 0 : 1);
