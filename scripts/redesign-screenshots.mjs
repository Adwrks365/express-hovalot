import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] || "http://localhost:3010";
const out = "audit/screenshots/global-redesign";
const widths = [1440, 390, 375, 360];
const parity = JSON.parse(fs.readFileSync("audit/reports/redesign-parity.json", "utf8"));
const urls = parity.results.filter((r) => r.path !== "/").map((r) => r.path);
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const qa = [];
let index = 0;
for (const p of urls) {
  index++;
  const slug = decodeURIComponent(p).replace(/^\/+|\/+$/g, "").replace(/[\\/:*?"<>|]+/g, "_") || "root";
  const entry = { path: p, file: {}, overflow: {}, forms: 0, orphanForms: 0, finalConversion: 0, rawHtml: 0 };
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base + encodeURI(decodeURIComponent(p)), { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.evaluate(async () => {
      document.querySelectorAll("img[loading='lazy']").forEach((img) => img.setAttribute("loading", "eager"));
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      await Promise.race([
        Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })))),
        new Promise((r) => setTimeout(r, 8000)),
      ]);
      window.scrollTo(0, 0);
      document.querySelectorAll("[data-scroll-reveal]").forEach((el) => el.classList.add("scroll-revealed"));
    });
    await page.waitForTimeout(350);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const forms = [...document.querySelectorAll("main form")];
      return {
        overflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
        forms: forms.length,
        orphanForms: forms.filter((f) => !f.closest("[data-final-conversion], #contact, #calculator, [data-section-type='calculator']")).length,
        finalConversion: document.querySelectorAll("[data-final-conversion]").length,
        rawHtml: document.querySelectorAll("main .elementor, main [class*='elementor-']").length,
      };
    });
    entry.overflow[width] = metrics.overflowPx;
    if (width === 1440) Object.assign(entry, { forms: metrics.forms, orphanForms: metrics.orphanForms, finalConversion: metrics.finalConversion, rawHtml: metrics.rawHtml });
    const file = `${String(index).padStart(2, "0")}-${slug}-${width}.png`;
    await page.screenshot({ path: path.join(out, file), fullPage: true });
    entry.file[width] = file;
    await page.close();
  }
  qa.push(entry);
  process.stdout.write(".");
}
await browser.close();
fs.writeFileSync("audit/reports/redesign-screenshots.json", JSON.stringify({ base, generated: new Date().toISOString(), qa }, null, 2), "utf8");
console.log(`\n${qa.length} URLs x ${widths.length} widths`);
