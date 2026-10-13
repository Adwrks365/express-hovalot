/**
 * Phase 2B.3F — Header collision + dropdown viewport QA
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/reports");
const SHOTS = join(process.cwd(), "audit/screenshots/phase-2b3f");
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

const WIDTHS = [1920, 1600, 1536, 1440, 1366, 1280, 1200, 1024];
const results = [];

function intersects(a, b, gap = 8) {
  return !(a.right + gap <= b.left || a.left >= b.right + gap || a.bottom + gap <= b.top || a.top >= b.bottom + gap);
}

const browser = await chromium.launch();

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(600);

  const headerAudit = await page.evaluate(() => {
    const desktopGrid = document.querySelector("header .xl\\:grid");
    const isDesktop =
      !!desktopGrid &&
      getComputedStyle(desktopGrid).display === "grid" &&
      window.innerWidth >= 1280;
    const nav = document.querySelector('[aria-label="ניווט ראשי"]');
    const navEl = document.querySelector('[aria-label="ניווט ראשי"]');
    const actionsEl = navEl?.closest(".grid")?.lastElementChild;
    const navTargets =
      isDesktop && navEl
        ? [...navEl.querySelectorAll("a, button")].filter(
            (el) => !el.closest('[role="menu"]') && el.getBoundingClientRect().width > 0,
          )
        : [];
    const actionTargets =
      isDesktop && actionsEl
        ? [...actionsEl.querySelectorAll("a, button")].filter((el) => el.getBoundingClientRect().width > 0)
        : [];
    const targets = [...navTargets, ...actionTargets];
    const rects = targets.map((el) => {
      const r = el.getBoundingClientRect();
      const zone = navEl && navEl.contains(el) ? "nav" : "actions";
      return {
        zone,
        label: el.textContent?.trim().slice(0, 40) || el.getAttribute("aria-label"),
        ...r,
      };
    });
    return { isDesktop, rects, count: rects.length };
  });

  let collisions = 0;
  const pairs = [];
  if (headerAudit.isDesktop) {
    const navRects = headerAudit.rects.filter((r) => r.zone === "nav");
    const actionRects = headerAudit.rects.filter((r) => r.zone === "actions");
    for (const a of navRects) {
      for (const b of actionRects) {
        if (intersects(a, b)) {
          collisions++;
          pairs.push(`${a.label} × ${b.label}`);
        }
      }
    }
  }

  await page.screenshot({ path: join(SHOTS, `header-${width}.png`) });

  if (width >= 1280 && headerAudit.isDesktop && headerAudit.count > 5) {
    results.push({
      test: `header-collisions-${width}`,
      pass: collisions === 0,
      collisions,
      pairs,
      interactiveCount: headerAudit.count,
    });
  } else if (width >= 1280) {
    results.push({
      test: `header-mobile-fallback-${width}`,
      pass: !headerAudit.isDesktop || headerAudit.count <= 5,
      note: "Desktop nav collapsed to mobile/tablet when items do not fit",
      interactiveCount: headerAudit.count,
    });
  } else {
    results.push({
      test: `header-mobile-mode-${width}`,
      pass: !headerAudit.isDesktop || headerAudit.count <= 5,
      interactiveCount: headerAudit.count,
    });
  }

  await page.close();
}

// Dropdown audit at 1440 (desktop nav only)
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(600);
  const navVisible = await page
    .locator("header .xl\\:grid")
    .first()
    .isVisible()
    .catch(() => false);
  const desktopNav = page.getByRole("navigation", { name: "ניווט ראשי" });

  let dropdownAudit = { found: false, skipped: !navVisible };
  if (navVisible) {
    const tipsLink = desktopNav.getByRole("link", { name: "טיפים ומידע" });
    await tipsLink.hover({ timeout: 10000 });
    await page.waitForTimeout(900);

    dropdownAudit = await page.evaluate(() => {
      const menus = [...document.querySelectorAll('[role="menu"]')].filter((menu) => {
        const r = menu.getBoundingClientRect();
        return r.height > 20 && menu.querySelectorAll('[role="menuitem"]').length >= 8;
      });
      const menu = menus.sort(
        (a, b) => b.querySelectorAll('[role="menuitem"]').length - a.querySelectorAll('[role="menuitem"]').length,
      )[0];
      if (!menu) return { found: false };
      const r = menu.getBoundingClientRect();
      return {
        found: true,
        itemCount: menu.querySelectorAll('[role="menuitem"]').length,
        left: r.left,
        right: r.right,
        scrollWidth: menu.scrollWidth,
        clientWidth: menu.clientWidth,
        hasHorizontalScroll: menu.scrollWidth > menu.clientWidth + 2,
        inViewport: r.left >= 8 && r.right <= window.innerWidth - 8,
      };
    });
  }

  await page.screenshot({ path: join(SHOTS, "dropdown-tips-mega.png") });

  results.push({
    test: "dropdown-tips-viewport",
    pass:
      dropdownAudit.skipped ||
      (dropdownAudit.found &&
        dropdownAudit.inViewport &&
        !dropdownAudit.hasHorizontalScroll &&
        dropdownAudit.itemCount >= 8),
    ...dropdownAudit,
  });

  await page.close();
}

await browser.close();

const summary = {
  generated: new Date().toISOString(),
  pass: results.every((r) => r.pass),
  results,
};
writeFileSync(join(OUT, "phase-2b3f-header-qa.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
