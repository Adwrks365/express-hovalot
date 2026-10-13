import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/reports");
mkdirSync(OUT, { recursive: true });

const results = [];
const browser = await chromium.launch();

async function test(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, pass: true, ...detail });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.log("FAIL", name, e.message);
  }
}

await test("header-desktop-no-wrap-1536", async () => {
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
  await nav.waitFor({ state: "visible", timeout: 5000 });
  const wraps = await nav.evaluate((el) => {
    const links = [...el.querySelectorAll("a")];
    return links.some((a) => a.getBoundingClientRect().height > 36);
  });
  await page.close();
  if (wraps) throw new Error("Top-level nav links appear wrapped");
  return {};
});

await test("header-submenu-opens", async () => {
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const tips = page.getByRole("navigation", { name: "ניווט ראשי" }).getByRole("link", { name: /טיפים ומידע/ });
  await tips.hover();
  const menu = page.getByRole("menu");
  await menu.waitFor({ state: "visible", timeout: 3000 });
  await page.close();
  return {};
});

await test("header-outside-click-closes", async () => {
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const tips = page.getByRole("navigation", { name: "ניווט ראשי" }).getByRole("link", { name: /טיפים ומידע/ });
  await tips.click();
  await page.mouse.click(10, 10);
  const visible = await page.getByRole("menu").isVisible().catch(() => false);
  await page.close();
  if (visible) throw new Error("Menu still visible after outside click");
  return {};
});

await test("header-escape-closes", async () => {
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const tips = page.getByRole("navigation", { name: "ניווט ראשי" }).getByRole("link", { name: /טיפים ומידע/ });
  await tips.click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const visible = await page.getByRole("menu").isVisible().catch(() => false);
  await page.close();
  if (visible) throw new Error("Menu still visible after Escape");
  return {};
});

const articlePath = "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/";

await test("article-toc-closed-default", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: "תוכן עניינים" });
  const expanded = await btn.getAttribute("aria-expanded");
  await page.close();
  if (expanded !== "false") throw new Error(`Expected aria-expanded=false, got ${expanded}`);
  return {};
});

await test("article-toc-opens", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: "תוכן עניינים" });
  await btn.click();
  const panel = page.locator("#article-toc-panel");
  if (await panel.getAttribute("hidden") !== null) throw new Error("TOC panel still hidden");
  await page.close();
  return {};
});

await test("article-toc-anchor-scroll", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "תוכן עניינים" }).click();
  const firstLink = page.locator("#article-toc-panel a").first();
  const href = await firstLink.getAttribute("href");
  await firstLink.click();
  await page.waitForTimeout(1200);
  const id = href?.replace("#", "");
  const inView = await page.evaluate((targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-offset").trim();
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const offset = raw.endsWith("rem") ? Number.parseFloat(raw) * rootSize : Number.parseFloat(raw) || 88;
    return r.top >= offset - 8 && r.top <= offset + 48;
  }, id);
  await page.close();
  if (!inView) throw new Error("Heading not scrolled into view with header offset");
  return {};
});

await test("article-sidebar-components", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "מאמרים אחרונים" }).waitFor();
  await page.getByRole("heading", { name: "קטגוריות" }).waitFor();
  await page.getByRole("heading", { name: "טופס יצירת קשר" }).waitFor();
  const tocInAside = await page.locator("aside").getByRole("button", { name: "תוכן עניינים" }).count();
  await page.close();
  if (tocInAside > 0) throw new Error("TOC found in sidebar");
  return {};
});

await test("article-phone-no-wrap", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
  const phones = page.locator('a[href^="tel:"]');
  const count = await phones.count();
  for (let i = 0; i < count; i++) {
    const nowrap = await phones.nth(i).evaluate((el) => getComputedStyle(el).whiteSpace === "nowrap");
    if (!nowrap) throw new Error("Phone link missing nowrap");
  }
  await page.close();
  return { phoneLinks: count };
});

await test("article-prev-next-valid", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "ניווט מאמרים" });
  const links = nav.locator("a");
  const n = await links.count();
  for (let i = 0; i < n; i++) {
    const href = await links.nth(i).getAttribute("href");
    if (!href || href === "#") throw new Error("Invalid prev/next href");
  }
  await page.close();
  return { linkCount: n };
});

for (const width of [1440, 1366, 1280, 1024, 768, 430, 390, 360]) {
  await test(`responsive-no-overflow-${width}`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${BASE}${encodeURI(articlePath)}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    await page.close();
    if (overflow) throw new Error("Horizontal overflow detected");
    return {};
  });
}

writeFileSync(join(OUT, "phase-2b3c-qa.json"), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));
await browser.close();
process.exit(results.every((r) => r.pass) ? 0 : 1);
