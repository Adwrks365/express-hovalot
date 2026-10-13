import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";

const PAGES = [
  { name: "storage", path: "/אחסון-תכולה-לטווח-קצר/" },
  { name: "about", path: "/about-us/" },
  { name: "faq", path: "/שאלות-נפוצות/" },
  { name: "contact", path: "/צרו-קשר/" },
  { name: "article", path: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/" },
];

const VIEWPORTS = [
  { label: "desktop-1440", w: 1440, h: 900 },
  { label: "tablet-768", w: 768, h: 1024 },
  { label: "mobile-390", w: 390, h: 844 },
  { label: "mobile-360", w: 360, h: 740 },
];

const report = {
  contentWidth: [],
  oversizedMedia: [],
  verticalGaps: [],
  rawLogoStacks: [],
};

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const page of PAGES) {
    const tab = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await tab.goto(`${BASE}${encodeURI(page.path)}`, { waitUntil: "networkidle", timeout: 90000 });
    await tab.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await tab.waitForTimeout(600);

    const findings = await tab.evaluate(
      ({ vpLabel, pageName, isMobile }) => {
        const vw = window.innerWidth;
        const containers = [...document.querySelectorAll('[data-layout="container"]')];
        const articleMain = [...document.querySelectorAll("article")].find((a) =>
          a.querySelector(".rich-text-article"),
        );
        const main =
          articleMain ||
          containers.sort(
            (a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width,
          )[0] ||
          document.querySelector("main") ||
          document.body;
        const rect = main.getBoundingClientRect();
        const pct = Math.round((rect.width / vw) * 100);
        const out = { contentWidth: [], oversizedMedia: [], verticalGaps: [], rawLogoStacks: [] };

        const minPct = isMobile ? 80 : 40;
        if (pct < minPct) {
          out.contentWidth.push({
            page: pageName,
            viewport: vpLabel,
            widthPx: Math.round(rect.width),
            viewportPx: vw,
            pct,
          });
        }

        document.querySelectorAll("img").forEach((img) => {
          const r = img.getBoundingClientRect();
          const cls = img.className || "";
          const isIcon = cls.includes("media-role-icon");
          const isLogo = cls.includes("media-role-logo") || cls.includes("logo");
          const isAvatar = cls.includes("media-role-avatar");
          const mobileLimit = isIcon ? 100 : isLogo ? 120 : isAvatar ? 220 : null;
          if (mobileLimit && isMobile && (r.width > mobileLimit || r.height > mobileLimit)) {
            out.oversizedMedia.push({
              page: pageName,
              viewport: vpLabel,
              role: isIcon ? "icon" : isLogo ? "logo" : "avatar",
              w: Math.round(r.width),
              h: Math.round(r.height),
              src: img.getAttribute("src")?.slice(-40),
            });
          }
          if ((isIcon || isLogo) && r.width > vw * 0.9) {
            out.oversizedMedia.push({
              page: pageName,
              viewport: vpLabel,
              role: isIcon ? "icon" : "logo",
              w: Math.round(r.width),
              h: Math.round(r.height),
              note: ">90% viewport",
            });
          }
        });

        const blocks = [...main.querySelectorAll("section, .rich-text > *, article > *")];
        for (let i = 0; i < blocks.length - 1; i++) {
          const a = blocks[i].getBoundingClientRect();
          const b = blocks[i + 1].getBoundingClientRect();
          const gap = b.top - a.bottom;
          const limit = isMobile ? 120 : 180;
          if (gap > limit) {
            out.verticalGaps.push({
              page: pageName,
              viewport: vpLabel,
              gapPx: Math.round(gap),
              before: blocks[i].tagName + (blocks[i].className ? `.${blocks[i].className.split(" ")[0]}` : ""),
            });
          }
        }

        document.querySelectorAll(".rich-text img").forEach((img) => {
          if (img.closest(".rich-text-logo-cluster, .rich-text-image-gallery, .logo-marquee")) return;
          const next = img.nextElementSibling;
          if (next?.tagName === "IMG" && !next.closest(".rich-text-logo-cluster, .rich-text-image-gallery")) {
            out.rawLogoStacks.push({ page: pageName, viewport: vpLabel, pair: true });
          }
        });

        return out;
      },
      { vpLabel: vp.label, pageName: page.name, isMobile: vp.w < 768 },
    );

    report.contentWidth.push(...findings.contentWidth);
    report.oversizedMedia.push(...findings.oversizedMedia);
    report.verticalGaps.push(...findings.verticalGaps);
    report.rawLogoStacks.push(...findings.rawLogoStacks);
    await tab.close();
  }
}

await browser.close();

const summary = {
  contentWidthViolations: report.contentWidth.length,
  oversizedMediaViolations: report.oversizedMedia.length,
  verticalGapViolations: report.verticalGaps.length,
  rawLogoStackViolations: report.rawLogoStacks.length,
};

console.log(JSON.stringify({ summary, report }, null, 2));
process.exit(
  summary.contentWidthViolations +
    summary.oversizedMediaViolations +
    summary.rawLogoStackViolations >
    0
    ? 1
    : 0,
);
