import * as cheerio from "cheerio";
import type { ContentLink, ListBlock, ProseContent } from "@/lib/structured-content/types";
import { wpUrlToLocal } from "@/lib/media";

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function extractLinksFromHtml(html: string): ContentLink[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const links: ContentLink[] = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = normalizeText($(el).text());
    if (!label || label.length > 120) return;
    const key = `${href}|${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    let localHref = href;
    if (href.includes("express-hovalot.co.il") || href.startsWith("/")) {
      try {
        if (href.startsWith("http")) {
          const u = new URL(href);
          localHref = u.pathname.endsWith("/") ? u.pathname : `${u.pathname}/`;
        }
      } catch {
        /* keep */
      }
    }
    links.push({ href: localHref, label });
  });
  return links;
}

/**
 * Extract semantic text from HTML — strips Elementor layout wrappers.
 * Preserves tables as isolated HTML for accessibility.
 */
export function extractProseContent(html: string, options?: { stripHeading?: string | null }): ProseContent {
  if (!html?.trim()) return { paragraphs: [] };

  const $ = cheerio.load(`<div id="root">${html}</div>`, {}, false);
  const root = $("#root");

  $("script, style, .elementor-widget-spacer, .elementor-spacer").remove();
  $("h2, h3, h4").each((_, el) => {
    const text = normalizeText($(el).text());
    if (options?.stripHeading && text === normalizeText(options.stripHeading)) {
      $(el).remove();
    }
  });

  const paragraphs: string[] = [];
  const lists: ListBlock[] = [];
  let tableHtml: string | null = null;

  root.find("table").each((_, table) => {
    if (!tableHtml) {
      tableHtml = $.html(table)?.trim() || null;
      $(table).remove();
    }
  });

  root.find("ul, ol").each((_, list) => {
    const items: string[] = [];
    $(list)
      .find("> li")
      .each((__, li) => {
        const t = normalizeText($(li).text());
        if (t) items.push(t);
      });
    if (items.length) lists.push({ type: list.tagName === "ol" ? "ol" : "ul", items });
    $(list).remove();
  });

  root.find("p, blockquote").each((_, el) => {
    const t = normalizeText($(el).text());
    if (t.length >= 8) paragraphs.push(t);
  });

  if (!paragraphs.length) {
    const fallback = normalizeText(root.text());
    if (fallback.length >= 20) paragraphs.push(fallback);
  }

  return {
    paragraphs,
    lists: lists.length ? lists : undefined,
    tableHtml,
  };
}

export function proseFromPlainText(text: string): ProseContent {
  const parts = text
    .split(/\n{2,}/)
    .map((p) => normalizeText(p))
    .filter((p) => p.length >= 8);
  return { paragraphs: parts.length ? parts : text.trim() ? [normalizeText(text)] : [] };
}

export function featureCardDescriptionToPlain(descriptionHtml: string): string {
  return extractProseContent(descriptionHtml).paragraphs.join("\n\n");
}

export function introProseFromHtml(html: string): ProseContent | null {
  const body = extractProseContent(html);
  if (!body.paragraphs.length && !body.lists?.length && !body.tableHtml) return null;
  return body;
}

export function resolveLocalImage(src: string | null | undefined): string | null {
  if (!src) return null;
  return wpUrlToLocal(src) || src;
}
