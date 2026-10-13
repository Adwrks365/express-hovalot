/**
 * Build render-ready structured page data from Elementor section inventory.
 * Source: audit/reports/elementor-structure/*.json (never overwrites pages.json/posts.json)
 */
import * as cheerio from "cheerio";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import mediaMap from "../src/content/media-map.json" with { type: "json" };

const REFERENCE_PATHS = new Set([
  "/about-us",
  "/אחסון-תכולה-לטווח-קצר",
  "/אחסון-משטחים",
  "/צרו-קשר",
  "/שאלות-נפוצות",
  "/הצעת-מחיר",
]);

/** Hand-curated reference JSON — never overwrite from auto-build */
const CURATED_PATHS = new Set([
  "/about-us",
  "/הובלת-דירה-בירושלים",
  "/אחסון-תכולה-לטווח-קצר",
  "/אחסון-משטחים",
  "/צרו-קשר",
  "/שאלות-נפוצות",
  "/הצעת-מחיר",
]);

const ARTICLE_PATH = "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026";

const IN_DIR = join(process.cwd(), "audit/reports/elementor-structure");
const OUT_DIR = join(process.cwd(), "src/content/structured");
mkdirSync(OUT_DIR, { recursive: true });

const bySource = new Map();
const byFilename = new Map();
for (const item of mediaMap.items) {
  if (item.localPath) {
    bySource.set(item.sourceUrl, item.localPath);
    const fn = item.sourceUrl.split("/").pop()?.split("?")[0]?.toLowerCase();
    if (fn) byFilename.set(fn, item.localPath);
  }
}

function normalizeUploadFilename(filename) {
  return filename.replace(/-\d+x\d+(?=\.[a-z]+$)/i, "");
}

function wpUrlToLocal(url) {
  if (!url) return null;
  const clean = url.split("?")[0];
  if (bySource.has(url) || bySource.has(clean)) return bySource.get(url) || bySource.get(clean);
  const raw = clean.split("/").pop()?.toLowerCase();
  const fn = raw ? normalizeUploadFilename(raw) : raw;
  if (fn && byFilename.has(fn)) return byFilename.get(fn);
  if (raw && byFilename.has(raw)) return byFilename.get(raw);
  if (url.includes("/wp-content/uploads/")) return url.replace("https://express-hovalot.co.il", "");
  return url;
}

function rewriteHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (href.includes("express-hovalot.co.il")) {
    try {
      const u = new URL(href);
      const p = decodeURIComponent(u.pathname).replace(/\/$/, "") || "/";
      return p === "/" ? "/" : `${p}/`;
    } catch {
      return href;
    }
  }
  return href;
}

function sanitizeHtml(html) {
  if (!html?.trim()) return "";
  const $ = cheerio.load(html, {}, false);
  $("script, style, iframe, form").remove();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const r = rewriteHref(href);
    if (r) $(el).attr("href", r);
  });
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", wpUrlToLocal(src));
  });
  return $.root().html() || "";
}

function extractFeatureCards(widgets) {
  let i = 0;
  let title = null;
  let introHtml = null;
  if (widgets[i]?.type === "heading") {
    title = widgets[i].heading;
    i++;
  }
  if (widgets[i]?.type === "text-editor") {
    introHtml = sanitizeHtml(widgets[i].html || "");
    i++;
  }
  const cards = [];
  while (i < widgets.length) {
    const w = widgets[i];
    if (w.type === "image" && widgets[i + 1]?.type === "heading") {
      cards.push({
        image: wpUrlToLocal(w.image?.src),
        imageAlt: w.image?.alt || widgets[i + 1].heading || "",
        title: widgets[i + 1].heading,
        descriptionHtml: sanitizeHtml(widgets[i + 2]?.html || `<p>${widgets[i + 2]?.text || ""}</p>`),
      });
      i += 3;
    } else i++;
  }
  return { title, introHtml, cards };
}

function extractIconFeatures(widgets) {
  return widgets
    .filter((w) => w.type === "icon-box")
    .map((w) => ({
      icon: wpUrlToLocal(w.image?.src),
      title: w.heading || "",
      description: w.text || "",
    }));
}

function extractStats(widgets) {
  return widgets
    .filter((w) => w.type === "counter")
    .map((w) => ({ label: w.text || "" }));
}

function extractFaqItems(widgets) {
  for (const w of widgets) {
    if (w.items?.length) return w.items;
  }
  return [];
}

function extractButtons(widgets) {
  return widgets
    .filter((w) => w.type === "button" && w.links?.length)
    .flatMap((w) => w.links.map((l) => ({ href: rewriteHref(l.href), label: l.text })));
}

function widgetsToRichHtml(widgets, skipH1 = true) {
  const parts = [];
  for (const w of widgets) {
    if (skipH1 && w.type === "heading" && w.headingLevel === "h1") continue;
    if (w.type === "heading" && w.heading) {
      parts.push(`<${w.headingLevel || "h2"}>${w.heading}</${w.headingLevel || "h2"}>`);
    } else if (w.type === "text-editor" && w.html) {
      parts.push(sanitizeHtml(w.html));
    } else if (w.type === "button" && w.links?.[0]) {
      const l = w.links[0];
      parts.push(`<p><a href="${rewriteHref(l.href)}" class="rich-text-cta-link">${l.text}</a></p>`);
    }
  }
  return parts.join("\n");
}

function transformSection(section) {
  const { kind, widgets, index } = section;

  if (kind === "hero") return null;

  if (kind === "iconFeatureGrid") {
    const items = extractIconFeatures(widgets);
    if (items.length) return { type: "iconFeatureGrid", id: `s${index}`, items };
  }

  if (kind === "faq") {
    const items = extractFaqItems(widgets);
    const introHtml = widgetsToRichHtml(widgets.filter((w) => w.type !== "toggle" && !w.items));
    if (items.length) return { type: "faq", id: `s${index}`, introHtml, items };
  }

  if (kind === "form") {
    const title = widgets.find((w) => w.type === "heading")?.heading || null;
    const bodyHtml = widgetsToRichHtml(widgets.filter((w) => w.type !== "form"));
    return { type: "formBlock", id: `s${index}`, title, bodyHtml };
  }

  if (kind === "cta") {
    const buttons = extractButtons(widgets);
    if (buttons.length) return { type: "ctaStrip", id: `s${index}`, buttons };
  }

  const stats = extractStats(widgets);
  if (stats.length >= 2) {
    return { type: "stats", id: `s${index}`, items: stats };
  }

  if (kind === "imageGrid" || kind === "imageText") {
    const { title, introHtml, cards } = extractFeatureCards(widgets);
    if (cards.length >= 2) {
      return { type: "featureGrid", id: `s${index}`, title, introHtml, cards };
    }
    const imgs = widgets.filter((w) => w.type === "image" && w.image?.src);
    if (imgs.length >= 3 && imgs.every((w) => !w.image?.alt || w.image.alt.length < 30)) {
      return {
        type: "logoGrid",
        id: `s${index}`,
        logos: imgs.map((w) => ({ src: wpUrlToLocal(w.image.src), alt: w.image.alt || "" })),
      };
    }
  }

  if (kind === "imageText") {
    const img = widgets.find((w) => w.type === "image")?.image;
    const html = widgetsToRichHtml(widgets.filter((w) => w.type !== "image"));
    if (img && html) {
      return {
        type: "imageText",
        id: `s${index}`,
        image: wpUrlToLocal(img.src),
        imageAlt: img.alt || "",
        html,
        imagePosition: "start",
      };
    }
  }

  const html = widgetsToRichHtml(widgets);
  if (html.trim()) return { type: "richText", id: `s${index}`, html };

  return null;
}

function extractHeroFromSection(section) {
  const imgW = section.widgets.find((w) => w.type === "image" && w.image?.src);
  const introW = section.widgets.find((w) => w.type === "text-editor");
  return {
    image: imgW?.image?.src ? wpUrlToLocal(imgW.image.src) : null,
    intro: introW?.text ? introW.text.slice(0, 320) : null,
  };
}

function buildPage(doc) {
  const blocks = [];
  let heroImage = null;
  let heroIntro = null;
  let heroTaken = false;

  for (const section of doc.sections) {
    const hasH1 = section.widgets.some((w) => w.headingLevel === "h1");
    const isPureHero = section.kind === "hero" || (hasH1 && section.kind !== "form" && section.index === 1);

    if (!heroTaken && (isPureHero || (section.index === 1 && hasH1))) {
      const h = extractHeroFromSection(section);
      if (h.image) heroImage = h.image;
      if (h.intro) heroIntro = h.intro;
      heroTaken = true;
      if (isPureHero && section.kind !== "form") continue;
    }

    const block = transformSection(section);
    if (block) blocks.push(block);
  }

  return {
    path: doc.path,
    wpId: doc.wpId,
    title: doc.title,
    sourceRef: doc.sourceRef,
    hero: { image: heroImage, intro: heroIntro },
    blocks,
  };
}

const files = readdirSync(IN_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
const registry = [];

for (const file of files) {
  const doc = JSON.parse(readFileSync(join(IN_DIR, file), "utf8"));
  if (!REFERENCE_PATHS.has(doc.path) && doc.path !== ARTICLE_PATH) continue;
  if (CURATED_PATHS.has(doc.path)) {
    console.log(doc.path, "→ skipped (curated)");
    continue;
  }
  const built = buildPage(doc);
  const outName = doc.path.replace(/^\//, "").replace(/\//g, "_") + ".json";
  writeFileSync(join(OUT_DIR, outName), JSON.stringify(built, null, 2));
  registry.push({ path: doc.path, file: outName, blockCount: built.blocks.length });
  console.log(doc.path, "→", built.blocks.length, "blocks");
}

writeFileSync(
  join(OUT_DIR, "registry.json"),
  JSON.stringify({ generated: new Date().toISOString(), pages: registry }, null, 2),
);
