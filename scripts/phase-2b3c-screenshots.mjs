import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const LOCAL = process.env.BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "audit/screenshots/phase-2b3c");
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { file: "article-desktop-1440", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", width: 1440, height: 900, fullPage: true },
  { file: "article-mobile-390", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/", width: 390, height: 844, fullPage: true },
  { file: "faq-desktop-1440", path: "/שאלות-נפוצות/", width: 1440, height: 900, fullPage: true },
  { file: "about-desktop-1440", path: "/about-us/", width: 1440, height: 900, fullPage: true },
  { file: "contact-desktop-1440", path: "/צרו-קשר/", width: 1440, height: 900, fullPage: true },
  { file: "storage-desktop-1440", path: "/אחסון-תכולה-לטווח-קצר/", width: 1440, height: 900, fullPage: true },
  { file: "header-1440", path: "/", width: 1440, height: 900, fullPage: false, clip: "header" },
  { file: "header-1366", path: "/", width: 1366, height: 900, fullPage: false, clip: "header" },
  { file: "header-390", path: "/", width: 390, height: 844, fullPage: false, clip: "header" },
  { file: "dropdown-open-1536", path: "/", width: 1536, height: 900, fullPage: false, clip: "header", dropdown: true },
];

const browser = await chromium.launch();

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
  const url = `${LOCAL}${encodeURI(shot.path)}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(shot.dropdown ? 800 : 1200);
    if (shot.dropdown) {
      const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
      const tips = nav.getByRole("link", { name: /טיפים ומידע/ });
      await tips.hover();
      await page.waitForTimeout(400);
    }
    const file = join(OUT, `${shot.file}.png`);
    if (shot.clip === "header") {
      await page.getByRole("banner").screenshot({ path: file });
    } else if (shot.fullPage) {
      await page.screenshot({ path: file, fullPage: true });
    } else {
      await page.screenshot({ path: file });
    }
    console.log("OK", file);
  } catch (e) {
    console.error("FAIL", url, e.message);
  } finally {
    await page.close();
  }
}

await browser.close();
