import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3129";
const outDir = path.join("audit", "screenshots", "phase-2a20");

async function overflow(page) {
  return page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  );
}

function parseTranslateX(transform) {
  if (!transform || transform === "none") return 0;
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    return parts[4] || 0;
  }
  const m3 = transform.match(/matrix3d\(([^)]+)\)/);
  if (m3) {
    const parts = m3[1].split(",").map((s) => parseFloat(s.trim()));
    return parts[12] || 0;
  }
  return 0;
}

async function truckTransform(page) {
  return page.evaluate(() => {
    const el = document.querySelector("[data-truck-motion]");
    if (!el) return null;
    return getComputedStyle(el).transform;
  });
}

async function marqueeFillRatio(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector(".logo-marquee");
    const track = document.querySelector(".logo-marquee-track");
    if (!viewport || !track) return null;
    const vr = viewport.getBoundingClientRect();
    const cells = [...track.querySelectorAll(".marquee-set:first-child > div")];
    let covered = 0;
    for (let x = vr.left + 4; x < vr.right - 4; x += 24) {
      const hit = cells.some((cell) => {
        const r = cell.getBoundingClientRect();
        return x >= r.left && x <= r.right && r.top < vr.bottom && r.bottom > vr.top;
      });
      if (hit) covered++;
    }
    const samples = Math.floor((vr.width - 8) / 24);
    return { ratio: samples ? covered / samples : 0, samples, covered, viewportWidth: Math.round(vr.width) };
  });
}

async function visibleLogoCount(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector(".logo-marquee");
    if (!viewport) return 0;
    const vr = viewport.getBoundingClientRect();
    return [...document.querySelectorAll(".logo-marquee-track img")].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.right > vr.left + 2 && r.left < vr.right - 2 && r.width > 10;
    }).length;
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = { baseUrl, timestamp: new Date().toISOString() };

  // Desktop marquee
  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desk.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  await desk.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
  await desk.waitForTimeout(400);

  results.marqueeShift = await desk.evaluate(() =>
    getComputedStyle(document.querySelector(".logo-marquee-track")).getPropertyValue("--marquee-shift"),
  );
  results.marqueeDuration = await desk.evaluate(() =>
    getComputedStyle(document.querySelector(".logo-marquee-track")).animationDuration,
  );

  const marqueeSamples = [];
  for (const [label, wait] of [
    ["start", 0],
    ["mid", 7000],
    ["late", 14000],
  ]) {
    if (wait) await desk.waitForTimeout(wait);
    marqueeSamples.push({
      label,
      fill: await marqueeFillRatio(desk),
      visibleLogos: await visibleLogoCount(desk),
      trackTransform: await desk.evaluate(() =>
        getComputedStyle(document.querySelector(".logo-marquee-track")).transform,
      ),
    });
    await desk.locator(".logo-marquee").screenshot({
      path: path.join(outDir, `clients-desktop-${label}.png`),
    });
  }
  results.marqueeDesktop = marqueeSamples;

  await desk.locator(".logo-marquee").hover();
  await desk.waitForTimeout(300);
  results.marqueePause = await desk.evaluate(() =>
    getComputedStyle(document.querySelector(".logo-marquee-track")).animationPlayState,
  );

  // Truck desktop A/B/C/D
  const truckStages = {};
  const scrollPositions = {
    A: async (p) => {
      await p.evaluate(() => {
        const s = document.getElementById("trust-truck");
        if (!s) return;
        const top = s.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - window.innerHeight * 0.88);
      });
    },
    B: async (p) => {
      await p.evaluate(() => {
        const s = document.getElementById("trust-truck");
        if (!s) return;
        const top = s.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - window.innerHeight * 0.55);
      });
    },
    C: async (p) => {
      await p.evaluate(() => {
        const s = document.getElementById("trust-truck");
        if (!s) return;
        const top = s.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - window.innerHeight * 0.25);
      });
    },
    D: async (p) => {
      await p.evaluate(() => {
        const s = document.getElementById("trust-truck");
        if (!s) return;
        const top = s.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + window.innerHeight * 0.05);
      });
    },
  };

  for (const stage of ["A", "B", "C", "D"]) {
    await scrollPositions[stage](desk);
    await desk.waitForTimeout(350);
    const tf = await truckTransform(desk);
    truckStages[stage] = { transform: tf, translateX: Math.round(parseTranslateX(tf)) };
    await desk.locator("#trust-truck").screenshot({ path: path.join(outDir, `truck-desktop-${stage}.png`) });
  }
  results.truckDesktop = truckStages;
  results.truckDesktopTravel = truckStages.D.translateX - truckStages.A.translateX;

  results.parity = await desk.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    services: document.querySelectorAll("section.bg-white article").length,
    faq: document.querySelectorAll('[id^="faq-button-"]').length,
    calculator: document.querySelectorAll("#calculator").length,
    logosSr: document.querySelectorAll('[aria-label="לקוחות שבחרו באקספרס הובלות"] li').length,
  }));
  results.overflow1440 = await overflow(desk);
  await desk.close();

  // Mobile marquee + truck
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  await mob.getByRole("heading", { name: "לקוחות שבחרו באקספרס הובלות" }).scrollIntoViewIfNeeded();
  await mob.waitForTimeout(400);
  await mob.locator(".logo-marquee").screenshot({ path: path.join(outDir, "clients-mobile-start.png") });
  await mob.waitForTimeout(6000);
  results.marqueeMobileVisible = await visibleLogoCount(mob);
  await mob.locator(".logo-marquee").screenshot({ path: path.join(outDir, "clients-mobile-mid.png") });
  results.marqueeMobileFill = await marqueeFillRatio(mob);

  const truckMob = {};
  for (const stage of ["A", "C", "D"]) {
    await scrollPositions[stage](mob);
    await mob.waitForTimeout(350);
    const tf = await truckTransform(mob);
    truckMob[stage] = { transform: tf, translateX: Math.round(parseTranslateX(tf)) };
    await mob.locator("#trust-truck").screenshot({ path: path.join(outDir, `truck-mobile-${stage}.png`) });
  }
  results.truckMobile = truckMob;
  results.truckMobileTravel = truckMob.D.translateX - truckMob.A.translateX;
  await mob.close();

  // Hero mobile viewports
  for (const { w, h, name } of [
    { w: 360, h: 800, name: "360" },
    { w: 390, h: 844, name: "390" },
    { w: 430, h: 932, name: "430" },
  ]) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
    results[`overflow${w}`] = await overflow(p);
    if (name === "390") {
      results.heroMobile390 = await p.evaluate(() => {
        const img = document.querySelector("section.relative.min-h-\\[420px\\] img.lg\\:hidden");
        const s = img ? getComputedStyle(img) : null;
        return { objectPosition: s?.objectPosition, src: img?.getAttribute("src")?.slice(-40) };
      });
    }
    await p.locator("[data-hero-content]").screenshot({ path: path.join(outDir, `hero-mobile-${name}.png`) });
    await p.close();
  }

  // Reduced motion
  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await rm.emulateMedia({ reducedMotion: "reduce" });
  await rm.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  results.reducedMotion = await rm.evaluate(() => ({
    marqueeAnim: document.querySelector(".logo-marquee-track")
      ? getComputedStyle(document.querySelector(".logo-marquee-track")).animationName
      : null,
    staticRow: !!document.querySelector(".motion-reduce\\:block ul"),
    truckTransform: getComputedStyle(document.querySelector("[data-truck-motion]") || document.body).transform,
  }));
  await rm.close();

  for (const w of [1024, 768, 375]) {
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
