import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { wpUrlToLocal } from "@/lib/media";
import { productionUrlToPath } from "@/lib/paths";

const STRIP_ATTRS = [
  "data-elementor-type",
  "data-elementor-id",
  "data-elementor-post-type",
  "data-element_type",
  "data-e-type",
  "data-id",
  "data-settings",
  "data-widget_type",
  "data-path-to-node",
  "data-index-in-node",
  "data-start",
  "data-end",
  "data-pm-slice",
  "data-is-last-node",
  "data-is-only-node",
  "fetchpriority",
];

const STRIP_CLASSES =
  /\belementor(?:-[a-z0-9_-]+)?\b|\bwp-image-\d+\b|\battachment-[a-z0-9_-]+\b|\bsize-[a-z0-9_-]+\b|\bcitation-\d+\b|\belementor-bc-flex-widget\b/gi;

const EMPTY_WRAPPER_SELECTORS = [
  ".elementor-section",
  ".elementor-container",
  ".elementor-column",
  ".elementor-column-wrap",
  ".elementor-widget-wrap",
  ".elementor-widget",
  ".elementor-widget-container",
  ".elementor-element",
  ".elementor-inner-section",
].join(",");

function rewriteHref(href: string | undefined): string | undefined {
  if (!href) return href;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (href.startsWith("https://wa.me/") || href.startsWith("http://wa.me/")) return href;

  const internalPath = productionUrlToPath(href);
  if (internalPath) {
    return internalPath === "/" ? "/" : `${internalPath}/`;
  }

  if (href.includes("/wp-content/uploads/")) {
    return wpUrlToLocal(href.split("?")[0]) ?? href;
  }

  return href;
}

function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href) && !href.includes("express-hovalot.co.il");
}

function unwrapElements($: cheerio.CheerioAPI, selector: string) {
  $(selector).each((_, el) => {
    const $el = $(el);
    const html = $el.html();
    if (html?.trim()) {
      $el.replaceWith(html);
    } else {
      $el.remove();
    }
  });
}

function stripPresentation($: cheerio.CheerioAPI, el: Element) {
  const style = $(el).attr("style");
  if (style) {
    const cleaned = style
      .replace(/font-size\s*:\s*[^;]+;?/gi, "")
      .replace(/line-height\s*:\s*[^;]+;?/gi, "")
      .replace(/width\s*:\s*[^;]+;?/gi, "")
      .replace(/height\s*:\s*[^;]+;?/gi, "")
      .replace(/max-width\s*:\s*[^;]+;?/gi, "")
      .replace(/min-height\s*:\s*[^;]+;?/gi, "")
      .replace(/margin-top\s*:\s*\d{2,}px;?/gi, "")
      .replace(/margin-bottom\s*:\s*\d{2,}px;?/gi, "")
      .replace(/padding-top\s*:\s*\d{2,}px;?/gi, "")
      .replace(/padding-bottom\s*:\s*\d{2,}px;?/gi, "")
      .trim();
    if (cleaned) $(el).attr("style", cleaned);
    else $(el).removeAttr("style");
  } else {
    $(el).removeAttr("style");
  }
  for (const attr of STRIP_ATTRS) {
    $(el).removeAttr(attr);
  }
  const cls = $(el).attr("class");
  if (cls) {
    const cleaned = cls.replace(STRIP_CLASSES, "").replace(/\s+/g, " ").trim();
    if (cleaned) $(el).attr("class", cleaned);
    else $(el).removeAttr("class");
  }
}

export type ProcessHtmlOptions = {
  /** Remove first H1 in body (hero renders page H1) */
  stripDuplicateH1?: boolean;
};

/** Sanitize WordPress/Elementor HTML: strip builder noise, rewrite media + internal links. */
export function sanitizeWordPressHtml(html: string, options: ProcessHtmlOptions = {}): string {
  if (!html?.trim()) return "";

  const $ = cheerio.load(html, {}, false);

  $("script, iframe, object, embed, form, style").remove();
  $(".elementor-spacer, .elementor-widget-spacer, .elementor-divider, .elementor-widget-divider").remove();
  $('[class*="elementor-spacer"]').remove();

  $("[onclick], [onload], [onerror]").each((_, el) => {
    $(el).removeAttr("onclick onload onerror");
  });

  // Unwrap Elementor layout shells (content preserved)
  for (let i = 0; i < 6; i++) {
    unwrapElements($, EMPTY_WRAPPER_SELECTORS);
  }

  $("div, section, span").each((_, el) => {
    if (!("tagName" in el) || el.type !== "tag") return;
    stripPresentation($, el);
    const $el = $(el);
    const text = $el.text().replace(/\s+/g, "").trim();
    const hasMedia = $el.find("img, table, ul, ol, h2, h3, h4, p, a").length > 0;
    if (!text && !hasMedia && !$el.find("img, table, iframe").length) {
      $el.remove();
    }
  });

  if (options.stripDuplicateH1) {
    $("h1").first().remove();
  }

  $("img").each((_, el) => {
    const $img = $(el);
    const src = $img.attr("src");
    if (src) {
      const local = wpUrlToLocal(src.split("?")[0]);
      if (local) $img.attr("src", local);
      else $img.remove();
    }
    $img.removeAttr("srcset sizes width height");
    $img.attr("loading", $img.attr("loading") || "lazy");
    $img.attr("decoding", "async");
    $img.addClass("rich-text-image");
    const cls = $img.attr("class");
    if (cls) {
      const cleaned = cls.replace(STRIP_CLASSES, "").replace(/\s+/g, " ").trim();
      if (cleaned) $img.attr("class", cleaned);
      else $img.removeAttr("class");
      $img.addClass("rich-text-image");
    }
  });

  $("table").each((_, el) => {
    const $table = $(el);
    if (!$table.parent().hasClass("rich-text-table-wrap")) {
      $table.wrap('<div class="rich-text-table-wrap"></div>');
    }
    $table.addClass("rich-text-table");
  });

  $("a[href]").each((_, el) => {
    const $a = $(el);
    const href = $a.attr("href");
    if (!href) return;

    const rewritten = rewriteHref(href);
    if (rewritten) $a.attr("href", rewritten);

    const text = $a.text().trim();
    const isWa = (rewritten || href).includes("wa.me");
    const isTel = (rewritten || href).startsWith("tel:");
    const isQuote =
      text.includes("הצעת מחיר") ||
      text.includes("להצעת מחיר") ||
      (rewritten || href).includes("הצעת-מחיר");

    if (isWa || isTel || isQuote || $a.hasClass("elementor-button")) {
      $a.addClass("rich-text-cta-link");
    }

    if (isExternalUrl(rewritten || href)) {
      $a.attr("target", "_blank");
      $a.attr("rel", "noopener noreferrer");
    }
  });

  // Wrap consecutive logo-like images for strip treatment
  $("p, div").each((_, el) => {
    const $el = $(el);
    const imgs = $el.find("> img");
    if (imgs.length >= 3 && $el.text().trim().length < 20) {
      $el.addClass("rich-text-logo-cluster");
    }
  });

  return $.root().html() || "";
}

/** Extract plain-text H1 from sanitized or raw HTML (for hero when no separate field). */
export function extractFirstHeading(html: string, level: "h1" | "h2" = "h1"): string | null {
  const $ = cheerio.load(html, {}, false);
  const text = $(level).first().text().replace(/\s+/g, " ").trim();
  return text || null;
}

/** Strip HTML tags for parity comparison. */
export function htmlToPlainText(html: string): string {
  const $ = cheerio.load(html, {}, false);
  return $.root().text().replace(/\s+/g, " ").trim();
}

/** Plain excerpt from HTML */
export function htmlExcerpt(html: string, maxLen = 160): string {
  const text = htmlToPlainText(html);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}…`;
}
