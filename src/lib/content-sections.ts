import * as cheerio from "cheerio";
import type { FaqItem } from "@/components/content/FaqAccordion";

export type ContentSectionKind = "intro" | "prose" | "faq" | "cta" | "stats";

export type ParsedContentSection = {
  id: string;
  kind: ContentSectionKind;
  heading: string | null;
  html: string;
  faqItems?: FaqItem[];
};

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0590-\u05FF-]+/g, "")
    .slice(0, 80);
}

function detectKind(heading: string | null, html: string): ContentSectionKind {
  const h = heading || "";
  if (/שאלות\s*נפוצות|FAQ/i.test(h)) return "faq";
  if (/רוצים לקבל הצעת מחיר|הצעת מחיר מהירה|חייגו עכשיו/i.test(h + html.slice(0, 200))) return "cta";
  if (/למה לבחור|ניסיון|לקוחות ממליצים/i.test(h) && /\d+\s*\+/.test(html)) return "stats";
  return "prose";
}

export function extractFaqItems(html: string): FaqItem[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const items: FaqItem[] = [];

  $("h3, h4").each((_, el) => {
    const question = $(el).text().replace(/\s+/g, " ").trim();
    if (!question) return;
    const answerParts: string[] = [];
    let sib = $(el).next();
    while (sib.length && !sib.is("h2, h3, h4")) {
      const t = sib.text().replace(/\s+/g, " ").trim();
      if (t) answerParts.push(t);
      sib = sib.next();
    }
    if (answerParts.length) items.push({ question, answer: answerParts.join("\n\n") });
  });

  if (items.length) return items;

  $("p").each((_, el) => {
    const $p = $(el);
    const strong = $p.find("strong, b").first().text().replace(/\s+/g, " ").trim();
    const full = $p.text().replace(/\s+/g, " ").trim();
    if (strong && full.length > strong.length + 5 && (strong.includes("?") || /^(מה|האם|איך|מתי|למה)/.test(strong))) {
      items.push({ question: strong.replace(/:$/, ""), answer: full.replace(strong, "").trim() });
    }
  });

  return items;
}

/** Split sanitized HTML into logical sections at H2 boundaries */
export function parseContentSections(html: string): ParsedContentSection[] {
  if (!html?.trim()) return [];

  const $ = cheerio.load(`<div id="root">${html}</div>`, {}, false);
  const root = $("#root");
  const sections: ParsedContentSection[] = [];

  const beforeFirstH2: string[] = [];
  let currentHeading: string | null = null;
  let currentNodes: string[] = [];

  const flush = () => {
    const body = currentNodes.join("").trim();
    if (!body && !currentHeading) return;
    const kind = detectKind(currentHeading, body);
    const section: ParsedContentSection = {
      id: slugify(currentHeading || `section-${sections.length}`) || `section-${sections.length}`,
      kind,
      heading: currentHeading,
      html: body,
    };
    if (kind === "faq") section.faqItems = extractFaqItems(body);
    sections.push(section);
    currentHeading = null;
    currentNodes = [];
  };

  root.contents().each((_, node) => {
    if (node.type === "tag" && node.tagName === "h2") {
      flush();
      currentHeading = $(node).text().replace(/\s+/g, " ").trim();
      return;
    }
    const chunk = node.type === "tag" ? $.html(node) : "";
    if (currentHeading !== null || sections.length > 0 || beforeFirstH2.length > 0) {
      currentNodes.push(chunk || "");
    } else {
      beforeFirstH2.push(chunk || "");
    }
  });
  flush();

  const introHtml = beforeFirstH2.join("").trim();
  if (introHtml) {
    sections.unshift({
      id: "intro",
      kind: "intro",
      heading: null,
      html: introHtml,
    });
  }

  return sections;
}

function normalizeMediaPath(path: string): string {
  try {
    return decodeURIComponent(path).split("/").pop()?.toLowerCase() || path.toLowerCase();
  } catch {
    return path.split("/").pop()?.toLowerCase() || path.toLowerCase();
  }
}

/** Remove hero duplicate image from intro/first section HTML */
export function stripHeroDuplicateImage(html: string, heroImage: string | null | undefined): string {
  if (!html?.trim() || !heroImage) return html;
  const heroKey = normalizeMediaPath(heroImage);
  const $ = cheerio.load(`<div id="root">${html}</div>`, {}, false);
  let stripped = false;
  $("#root img").each((_, el) => {
    if (stripped) return;
    const src = $(el).attr("src");
    if (!src) return;
    if (normalizeMediaPath(src) === heroKey) {
      const figure = $(el).closest("figure");
      if (figure.length) figure.remove();
      else $(el).remove();
      stripped = true;
    }
  });
  return $("#root").html() || html;
}

export function deduplicateContentSections(
  sections: ParsedContentSection[],
  pagePath: string,
): ParsedContentSection[] {
  const seenFaq = new Set<string>();
  const seenRich = new Set<string>();
  let ctaSeen = false;

  return sections.filter((section) => {
    const text = section.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (section.kind === "faq" && section.faqItems?.length) {
      const key = section.faqItems.map((i) => i.question).join("|");
      if (seenFaq.has(key)) return false;
      seenFaq.add(key);
      return true;
    }

    if (section.kind === "cta") {
      if (ctaSeen) return false;
      ctaSeen = true;
      return true;
    }

    if (/^(חייגו|התקשרו)/i.test(text) && text.length < 150 && text.includes("052")) return false;

    const hash = text.slice(0, 200).toLowerCase();
    if (hash && seenRich.has(hash)) return false;
    if (hash) seenRich.add(hash);

    void pagePath;
    return text.length > 0 || section.heading;
  });
}

export function extractFirstContentImage(html: string): string | null {
  const $ = cheerio.load(html, {}, false);
  let best: string | null = null;
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src || src.includes("icon") || src.includes("logo_small")) return;
    const w = Number($(el).attr("width") || 0);
    if (!best || w >= 400) best = src;
  });
  return best;
}

/** Pull Elementor background image URL from raw HTML before sanitization */
export function extractElementorHeroImage(rawHtml: string): string | null {
  const bgMatch = rawHtml.match(/background_background[^"]*"[^"]*"[^"]*"url":"([^"]+)"/);
  if (bgMatch?.[1]) return bgMatch[1].replace(/\\\//g, "/");
  const galleryMatch = rawHtml.match(/background_slideshow_gallery[^[]*\[[^\]]*"url":"([^"]+)"/);
  if (galleryMatch?.[1]) return galleryMatch[1].replace(/\\\//g, "/");
  return null;
}
