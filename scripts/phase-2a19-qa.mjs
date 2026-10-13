import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3126";
const outDir = path.join("audit", "screenshots", "phase-2a19");
const test404 = "/this-page-does-not-exist-phase-2a19";

async function overflow(page) {
  return page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl, timestamp: new Date().toISOString() };

  // 404 HTTP + content
  const r404 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const resp404 = await r404.goto(`${baseUrl}${test404}`, { waitUntil: "load", timeout: 60000 });
  results.http404 = resp404?.status();
  results.notFoundText = await r404.evaluate(() => ({
    has404: document.body.innerText.includes("404"),
    hasHeading: document.body.innerText.includes("העמוד לא נמצא"),
    hasHome: document.body.innerText.includes("חזרה לדף הבית"),
    hasWordPress: /WordPress|wordpress/i.test(document.body.innerText),
    hasMigration: document.body.innerText.includes("עמודי בדיקת") || document.body.innerText.includes("אינם מועברים"),
    hasAudit: /audit|migration/i.test(document.body.innerText),
  }));
  results.notFoundRobots = await r404.evaluate(() =>
    document.querySelector('meta[name="robots"]')?.getAttribute("content"),
  );
  await r404.screenshot({ path: path.join(outDir, "404-desktop.png") });
  await r404.close();

  const r404m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await r404m.goto(`${baseUrl}${test404}`, { waitUntil: "load", timeout: 60000 });
  results.overflow404_390 = await overflow(r404m);
  await r404m.screenshot({ path: path.join(outDir, "404-mobile-390.png") });
  await r404m.close();

  // Homepage parity
  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await home.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  results.parity = await home.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    services: document.querySelectorAll("section.bg-white article").length,
    faq: document.querySelectorAll('[id^="faq-button-"]').length,
    calculator: document.querySelectorAll("#calculator").length,
    clientLogosSr: document.querySelectorAll('[aria-label="לקוחות שבחרו באקספרס הובלות"] li').length,
    clientLogosVisual: document.querySelectorAll(".logo-marquee-track img").length,
  }));
  results.overflow1440 = await overflow(home);

  // Marquee
  await home.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
  await home.waitForTimeout(500);
  const t1 = await home.evaluate(() => {
    const track = document.querySelector(".logo-marquee-track");
    return track ? getComputedStyle(track).transform : null;
  });
  await home.waitForTimeout(1200);
  const t2 = await home.evaluate(() => {
    const track = document.querySelector(".logo-marquee-track");
    return track ? getComputedStyle(track).transform : null;
  });
  results.marqueeMoving = t1 !== t2;
  results.marqueeVisualCount = await home.evaluate(
    () => document.querySelectorAll(".logo-marquee-track img").length,
  );
  await home.screenshot({ path: path.join(outDir, "client-marquee-1440.png") });

  await home.locator(".logo-marquee").hover();
  await home.waitForTimeout(400);
  const paused = await home.evaluate(() => {
    const track = document.querySelector(".logo-marquee-track");
    return track ? getComputedStyle(track).animationPlayState : null;
  });
  results.marqueePauseOnHover = paused === "paused";
  await home.screenshot({ path: path.join(outDir, "client-marquee-hover-1440.png") });
  await home.close();

  // Hero mobile viewports
  for (const { w, h, name } of [
    { w: 360, h: 800, name: "360" },
    { w: 375, h: 812, name: "375" },
    { w: 390, h: 844, name: "390" },
    { w: 430, h: 932, name: "430" },
  ]) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`overflow${w}`] = await overflow(p);
    await p.locator("[data-hero-content]").screenshot({ path: path.join(outDir, `hero-mobile-${name}.png`) });
    if (name === "390") {
      results.heroMobile390 = await p.evaluate(() => {
        const img = document.querySelector("section.relative.min-h-\\[420px\\] img.lg\\:hidden");
        const style = img ? getComputedStyle(img) : null;
        return {
          objectPosition: style?.objectPosition,
          objectFit: style?.objectFit,
        };
      });
    }
    await p.close();
  }

  // Reduced motion marquee
  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await rm.emulateMedia({ reducedMotion: "reduce" });
  await rm.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  results.reducedMotionMarquee = await rm.evaluate(() => ({
    hasTrack: !!document.querySelector(".logo-marquee-track"),
    hasStaticScroll: !!document.querySelector(".overflow-x-auto ul"),
    animation: document.querySelector(".logo-marquee-track")
      ? getComputedStyle(document.querySelector(".logo-marquee-track")).animationName
      : "n/a",
  }));
  await rm.close();

  for (const w of [1024, 768]) {
    const p = await browser.newPage({ viewport: { width: w, height: 768 } });
    await p.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`overflow${w}`] = await overflow(p);
    await p.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
