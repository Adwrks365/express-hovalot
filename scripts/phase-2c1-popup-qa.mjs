import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.POPUP_QA_BASE || "http://localhost:3010";
const shotDir = path.join(root, "audit/screenshots/phase-2c1-popup");

const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error("FAIL:", msg);
}

async function main() {
  fs.mkdirSync(shotDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const providerCount = await page.locator("[data-minimized-lead-cta]").count();
  if (providerCount > 0) fail("pill visible on load");

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
  });
  await page.waitForTimeout(500);
  const dialog = page.locator('[role="dialog"]');
  if ((await dialog.count()) === 0) {
    await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await page.waitForTimeout(300);
  }

  const posts = JSON.parse(fs.readFileSync(path.join(root, "src/content/data/posts.json"), "utf8"));
  const articlePath = posts[0]?.path?.replace(/\/$/, "") || "/blog";
  await page.goto(`${base}${articlePath}/`, { waitUntil: "networkidle" });
  const trigger = page.locator("[data-open-contextual-popup]").first();
  if ((await trigger.count()) === 0) fail("no in-content popup trigger on article");
  else await trigger.click();
  await page.waitForTimeout(400);

  const modal = page.locator('[role="dialog"][aria-modal="true"]');
  if ((await modal.count()) === 0) fail("modal did not open via manual trigger path");
  else {
    await page.screenshot({ path: path.join(shotDir, "desktop-service-modal-manual.png") });
    const aria = await modal.first().getAttribute("aria-modal");
    if (aria !== "true") fail("aria-modal missing");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if ((await modal.count()) > 0) fail("ESC did not close modal");
    if ((await page.locator("[data-minimized-lead-cta]").count()) === 0) fail("pill missing after dismiss");
    await page.screenshot({ path: path.join(shotDir, "desktop-minimized-pill.png") });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}${articlePath}/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-open-contextual-popup]").first().click();
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  if (overflow) fail("horizontal overflow on mobile modal");
  await page.screenshot({ path: path.join(shotDir, "mobile-modal-390.png") });

  await page.goto(`${base}/צרו-קשר/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(41_000);
  if ((await page.locator('[role="dialog"]').count()) > 0) fail("auto opened on contact page");

  await page.goto(`${base}/הצעת-מחיר/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  if ((await page.locator('[role="dialog"]').count()) > 0) fail("auto opened on quote page");

  await browser.close();

  if (failures.length) {
    console.error("\n", failures.length, "failures");
    process.exit(1);
  }
  console.log("Popup QA passed. Screenshots in", shotDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
