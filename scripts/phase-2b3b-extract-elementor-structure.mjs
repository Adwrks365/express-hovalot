/**
 * Extract Elementor semantic section inventory from migrated contentHtml.
 * READ-ONLY on source data — writes audit/reports/elementor-structure/*.json
 */
import * as cheerio from "cheerio";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pages from "../src/content/data/pages.json" with { type: "json" };
import posts from "../src/content/data/posts.json" with { type: "json" };

const REFERENCE_PATHS = [
  "/אחסון-תכולה-לטווח-קצר",
  "/אחסון-משטחים",
  "/צרו-קשר",
  "/about-us",
  "/שאלות-נפוצות",
  "/הצעת-מחיר",
  "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
];

const OUT_DIR = join(process.cwd(), "audit/reports/elementor-structure");
mkdirSync(OUT_DIR, { recursive: true });

function widgetType($, el) {
  const cls = $(el).attr("class") || "";
  const m = cls.match(/elementor-widget-([a-z0-9_-]+)/);
  return m?.[1] || "unknown";
}

function textOf($, el) {
  return $(el).text().replace(/\s+/g, " ").trim();
}

function extractImage($, el) {
  const img = $(el).find("img").first();
  if (!img.length) return null;
  return {
    src: img.attr("src") || img.attr("data-src") || null,
    alt: img.attr("alt") || "",
  };
}

function extractLinks($, el) {
  const links = [];
  $(el)
    .find("a[href]")
    .each((_, a) => {
      links.push({ href: $(a).attr("href"), text: textOf($, a) });
    });
  return links;
}

function classifySection(widgets) {
  const types = widgets.map((w) => w.type);
  const headings = widgets.filter((w) => w.type === "heading").map((w) => w.heading);
  const hasForm = types.some((t) => t.includes("form"));
  const hasAccordion = types.some((t) => t.includes("accordion") || t.includes("toggle"));
  const iconBoxes = widgets.filter((w) => w.type === "icon-box" || w.type === "icon_box");
  const images = widgets.filter((w) => w.image);
  const buttons = widgets.filter((w) => w.type === "button" || w.links?.length);

  if (widgets.length === 1 && widgets[0].type === "heading" && widgets[0].headingLevel === "h1") {
    return "hero";
  }
  if (hasAccordion) return "faq";
  if (hasForm) return "form";
  if (iconBoxes.length >= 2) return "iconFeatureGrid";
  if (types.filter((t) => t === "image").length >= 3) return "imageGrid";
  if (images.length && widgets.some((w) => w.type === "text-editor" && w.text?.length > 80)) {
    return "imageText";
  }
  if (buttons.length >= 2 && widgets.some((w) => /הצעת מחיר|חייג|whatsapp/i.test(w.text || ""))) {
    return "cta";
  }
  if (headings.some((h) => /שאלות\s*נפוצות/i.test(h))) return "faq";
  if (iconBoxes.length === 1 && widgets.length <= 3) return "benefit";
  if (widgets.every((w) => w.type === "text-editor" || w.type === "heading")) return "richText";
  return "mixed";
}

function parseElementorHtml(html) {
  const $ = cheerio.load(html, {}, false);
  const sections = [];

  $("section.elementor-section").each((si, sec) => {
    const widgets = [];
    $(sec)
      .find(".elementor-widget")
      .each((_, wEl) => {
        const type = widgetType($, wEl);
        const item = { type, text: "", heading: null, headingLevel: null, image: null, links: [] };

        if (type === "heading") {
          const h = $(wEl).find("h1,h2,h3,h4,h5,h6").first();
          item.heading = textOf($, h);
          item.headingLevel = h.prop("tagName")?.toLowerCase() || null;
          item.text = item.heading;
        } else if (type === "text-editor") {
          item.html = $(wEl).find(".elementor-widget-container").html()?.trim() || "";
          item.text = textOf($, wEl);
        } else if (type === "image") {
          item.image = extractImage($, wEl);
        } else if (type === "icon-box") {
          item.heading = $(wEl).find(".elementor-icon-box-title").text().replace(/\s+/g, " ").trim();
          item.text = $(wEl).find(".elementor-icon-box-description").text().replace(/\s+/g, " ").trim();
          item.image = extractImage($, wEl);
        } else if (type === "button") {
          item.text = textOf($, wEl);
          item.links = extractLinks($, wEl);
        } else if (type.includes("accordion") || type.includes("toggle")) {
          item.items = [];
          $(wEl)
            .find(".elementor-accordion-item, .elementor-toggle-item")
            .each((_, acc) => {
              const q = $(acc).find(".elementor-accordion-title, .elementor-toggle-title").text().replace(/\s+/g, " ").trim();
              const a = $(acc).find(".elementor-accordion-content, .elementor-tab-content").text().replace(/\s+/g, " ").trim();
              if (q) item.items.push({ question: q, answer: a });
            });
        } else {
          item.text = textOf($, wEl).slice(0, 500);
          item.image = extractImage($, wEl);
          item.links = extractLinks($, wEl);
        }

        if (item.text || item.heading || item.image || item.items?.length || item.html) {
          widgets.push(item);
        }
      });

    if (!widgets.length) return;

    sections.push({
      index: si + 1,
      kind: classifySection(widgets),
      widgetCount: widgets.length,
      widgets,
    });
  });

  return sections;
}

const all = [...pages, ...posts];
const summary = [];

for (const path of REFERENCE_PATHS) {
  const item = all.find((x) => x.path === path);
  if (!item) {
    console.warn("Missing:", path);
    continue;
  }
  const sections = parseElementorHtml(item.contentHtml);
  const file = join(OUT_DIR, `${item.id}-${item.slug.replace(/[^\w\u0590-\u05FF-]/g, "_")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        path: item.path,
        wpId: item.id,
        title: item.title,
        type: item.type,
        sectionCount: sections.length,
        sections,
        sourceRef: `src/content/data/${item.type === "post" ? "posts" : "pages"}.json#${item.id}`,
      },
      null,
      2,
    ),
  );
  summary.push({ path, wpId: item.id, sectionCount: sections.length, kinds: sections.map((s) => s.kind) });
  console.log(path, "→", sections.length, "sections", sections.map((s) => s.kind).join(", "));
}

writeFileSync(join(OUT_DIR, "_summary.json"), JSON.stringify({ generated: new Date().toISOString(), summary }, null, 2));
