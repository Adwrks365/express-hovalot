/**
 * Phase 2B.3F — Reference page screenshot gate (prod vs local)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PROD = "https://express-hovalot.co.il";
const LOCAL = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b3f");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: "about", prod: "/about-us/", local: "/about-us/" },
  { slug: "storage-pallets", prod: "/אחסון-משטחים/", local: "/אחסון-משטחים/" },
  { slug: "storage-short", prod: "/אחסון-תכולה-לטווח-קצר/", local: "/אחסון-תכולה-לטווח-קצר/" },
];

const browser = await chromium.launch();

for (const p of PAGES) {
  for (const [kind, base] of [
    ["prod", PROD],
    ["local", LOCAL],
  ]) {
    const path = kind === "prod" ? p.prod : p.local;
    for (const [vp, suffix] of [
      [{ width: 1440, height: 900 }, "desktop"],
      [{ width: 390, height: 844 }, "mobile"],
    ]) {
      const page = await browser.newPage({ viewport: vp });
      await page.goto(`${base}${encodeURI(path)}`, {
        waitUntil: kind === "local" ? "networkidle" : "domcontentloaded",
        timeout: 90000,
      });
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 800));
        window.scrollTo(0, 0);
      });
      await page.screenshot({
        path: join(OUT, `${p.slug}-${kind}-${suffix}.png`),
        fullPage: true,
      });
      await page.close();
      console.log("shot", p.slug, kind, suffix);
    }
  }
}

await browser.close();
