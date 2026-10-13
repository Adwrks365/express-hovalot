import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { wpUrlToLocal } from "@/lib/media";
import { productionUrlToPath } from "@/lib/paths";
import type {
  ContentLink,
  InlineHtml,
  RichBlock,
  SourceColumn,
  SourceImage,
  SourceNode,
  SourceSection,
  Widget,
} from "@/lib/redesign/types";

type $Api = cheerio.CheerioAPI;

const existsCache = new Map<string, boolean>();

function localFileExists(localPath: string): boolean {
  if (!localPath.startsWith("/media/")) return true;
  const cached = existsCache.get(localPath);
  if (cached !== undefined) return cached;
  let decoded = localPath;
  try {
    decoded = decodeURIComponent(localPath);
  } catch {
    /* keep */
  }
  const ok = fs.existsSync(path.join(process.cwd(), "public", decoded));
  existsCache.set(localPath, ok);
  return ok;
}

export function resolveSourceImageSrc(src: string | undefined | null): string | null {
  if (!src) return null;
  const local = wpUrlToLocal(src.split("?")[0]!);
  if (!local || /^https?:/i.test(local)) return null;
  return localFileExists(local) ? local : null;
}

/** Drops truncated UTF-8 percent-escapes (e.g. "%d7%9" before "%D7%94") that make a source href undecodable. */
function repairPercentEncoding(h: string): string {
  try {
    decodeURIComponent(h);
    return h;
  } catch {
    const fixed = h.replace(/%[0-9a-f]{2}%[0-9a-f](?![0-9a-f])/gi, "");
    try {
      decodeURIComponent(fixed);
      return fixed;
    } catch {
      return h;
    }
  }
}

export function rewriteSourceHref(href: string | undefined | null): string {
  if (!href) return "";
  const h = repairPercentEncoding(href.trim());
  if (h.startsWith("tel:")) return `tel:${h.slice(4).replace(/%[0-9a-f]{2}/gi, "").replace(/[^\d+]/g, "")}`;
  if (h.startsWith("mailto:") || /^https?:\/\/(api\.)?wa\.me\//.test(h) || h.includes("whatsapp.com")) return h;
  if (h.startsWith("#elementor-action") || h === "#") return "#contact";
  if (h.startsWith("#")) return h;
  const internal = productionUrlToPath(h);
  if (internal) return internal === "/" ? "/" : `${internal}/`;
  if (h.includes("/wp-content/uploads/")) return wpUrlToLocal(h.split("?")[0]!) ?? h;
  return h;
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}

export function normalizeSpace(s: string): string {
  return s.replace(/[\s\u00a0\u200b]+/g, " ").trim();
}

/** Inline HTML limited to text, links and emphasis. */
export function toInline($: $Api, node: AnyNode): InlineHtml {
  const out: string[] = [];
  const walk = (n: AnyNode) => {
    if (n.type === "text") {
      out.push(escapeText((n as unknown as { data: string }).data));
      return;
    }
    if (n.type !== "tag") return;
    const el = n as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "svg") return;
    if (tag === "br") {
      out.push("<br>");
      return;
    }
    if (tag === "i" && /\bfa[srb]?\b|fa-/.test($(el).attr("class") || "")) return;
    const inner = () => el.children.forEach(walk);
    if (tag === "a") {
      const href = rewriteSourceHref($(el).attr("href"));
      if (!href || href === "#contact") {
        inner();
        return;
      }
      const ext = /^https?:/i.test(href);
      out.push(
        `<a href="${escapeAttr(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>`,
      );
      inner();
      out.push("</a>");
      return;
    }
    if (tag === "strong" || tag === "b") {
      out.push("<strong>");
      inner();
      out.push("</strong>");
      return;
    }
    if (tag === "em" || (tag === "i" && !$(el).attr("class"))) {
      out.push("<em>");
      inner();
      out.push("</em>");
      return;
    }
    inner();
  };
  walk(node);
  return out
    .join("")
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/<strong>\s*<\/strong>/g, "")
    .replace(/(\s*<br>\s*)+$/g, "")
    .replace(/^(\s*<br>\s*)+/g, "")
    .trim();
}

export function inlineToText(html: InlineHtml): string {
  return normalizeSpace(html.replace(/<br>/g, " ").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'));
}

function parseTable($: $Api, table: Element): Extract<RichBlock, { kind: "table" }> {
  const head: InlineHtml[][] = [];
  const body: InlineHtml[][] = [];
  $(table)
    .find("tr")
    .each((_, tr) => {
      const cells = $(tr)
        .children("th, td")
        .map((__, c) => toInline($, c))
        .get();
      if (!cells.length) return;
      const isHead = $(tr).parent().is("thead") || $(tr).children("td").length === 0;
      (isHead && !body.length ? head : body).push(cells);
    });
  return { kind: "table", head, body };
}

const BLOCK_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table", "img", "figure", "blockquote", "div", "section", "article",
]);

/** Converts editor HTML into ordered semantic blocks. */
export function parseRichBlocks($: $Api, root: AnyNode): RichBlock[] {
  const blocks: RichBlock[] = [];
  let loose: AnyNode[] = [];

  const flushLoose = () => {
    if (!loose.length) return;
    const html = loose.map((n) => toInline($, n)).join("").trim();
    loose = [];
    if (inlineToText(html)) blocks.push({ kind: "p", html: html.replace(/^(<br>\s*)+|(\s*<br>)+$/g, "") });
  };

  const pushImg = (img: Element) => {
    const src = resolveSourceImageSrc($(img).attr("src"));
    if (src) blocks.push({ kind: "img", src, alt: normalizeSpace($(img).attr("alt") || "") });
  };

  const visit = (n: AnyNode) => {
    if (n.type === "text") {
      if (normalizeSpace((n as unknown as { data: string }).data)) loose.push(n);
      return;
    }
    if (n.type !== "tag") return;
    const el = n as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "form" || tag === "iframe" || tag === "svg") return;
    if (!BLOCK_TAGS.has(tag)) {
      if ($(el).find("img").length && !normalizeSpace($(el).text())) {
        flushLoose();
        $(el).find("img").each((_, img) => pushImg(img));
        return;
      }
      if ($(el).find("p, ul, ol, table, h2, h3, h4").length) {
        flushLoose();
        el.children.forEach(visit);
        flushLoose();
        return;
      }
      loose.push(el);
      return;
    }
    flushLoose();
    if (tag === "p" || tag === "blockquote") {
      if ($(el).find("ul, ol, table, h2, h3, h4, p").length) {
        el.children.forEach(visit);
        flushLoose();
        return;
      }
      $(el).find("img").each((_, img) => pushImg(img));
      const html = toInline($, el);
      if (inlineToText(html)) blocks.push(tag === "p" ? { kind: "p", html } : { kind: "quote", html });
      return;
    }
    if (/^h[1-6]$/.test(tag)) {
      const html = toInline($, el);
      if (inlineToText(html)) {
        const level = Math.min(6, Math.max(2, Number(tag[1]))) as 2 | 3 | 4 | 5 | 6;
        blocks.push({ kind: "h", level, html });
      }
      return;
    }
    if (tag === "ul" || tag === "ol") {
      const items = $(el)
        .children("li")
        .map((_, li) => toInline($, li))
        .get()
        .filter((s) => inlineToText(s));
      if (items.length) blocks.push({ kind: "list", ordered: tag === "ol", items });
      return;
    }
    if (tag === "table") {
      const t = parseTable($, el);
      if (t.body.length || t.head.length) blocks.push(t);
      return;
    }
    if (tag === "img") {
      pushImg(el);
      return;
    }
    if (tag === "figure") {
      $(el).find("img").each((_, img) => pushImg(img));
      const cap = $(el).find("figcaption");
      if (cap.length && normalizeSpace(cap.text())) blocks.push({ kind: "p", html: toInline($, cap[0]!) });
      return;
    }
    el.children.forEach(visit);
    flushLoose();
  };

  (root as Element).children?.forEach(visit);
  flushLoose();
  return blocks;
}

function imageFrom($: $Api, img: Element | undefined): SourceImage | null {
  if (!img) return null;
  const src = resolveSourceImageSrc($(img).attr("src"));
  if (!src) return null;
  const width = Number($(img).attr("width")) || undefined;
  const height = Number($(img).attr("height")) || undefined;
  const raw = ($(img).attr("src") || "").split("?")[0]!.split("/").pop() || "";
  let origin = raw;
  try {
    origin = decodeURIComponent(raw);
  } catch {
    /* keep */
  }
  return { src, alt: normalizeSpace($(img).attr("alt") || ""), width, height, origin };
}

function parseWidget($: $Api, el: Element): Widget | null {
  const type = ($(el).attr("data-widget_type") || "").split(".")[0];
  const container = $(el).children(".elementor-widget-container").first();
  const scope = container.length ? container : $(el);

  switch (type) {
    case "heading":
    case "animated-headline": {
      const title = scope.find(".elementor-heading-title, h1, h2, h3, h4, h5, h6").first();
      const text = normalizeSpace((title.length ? title : scope).text());
      if (!text) return null;
      const tag = (title.prop("tagName") || "H2").toString().toLowerCase();
      const level = /^h[1-6]$/.test(tag) ? Number(tag[1]) : 6;
      const href = title.find("a").attr("href") || title.closest("a").attr("href");
      return { type: "heading", level, text, href: href ? rewriteSourceHref(href) : null };
    }
    case "text-editor": {
      const blocks = parseRichBlocks($, scope[0]!);
      return blocks.length ? { type: "text", blocks } : null;
    }
    case "image": {
      const image = imageFrom($, scope.find("img")[0]);
      if (!image) return null;
      const href = scope.find("a").attr("href");
      return { type: "image", image, href: href ? rewriteSourceHref(href) : null };
    }
    case "button": {
      const a = scope.find("a").first();
      const label = normalizeSpace(scope.find(".elementor-button-text").text() || a.text());
      if (!label) return null;
      return { type: "button", label, href: rewriteSourceHref(a.attr("href")) || "#contact" };
    }
    case "counter": {
      const num = scope.find(".elementor-counter-number");
      const raw = (num.attr("data-to-value") || "").trim();
      if (!/^\d+(\.\d+)?$/.test(raw)) return null;
      const delimiter = num.attr("data-delimiter") || "";
      const value =
        delimiter === "," && /^\d+$/.test(raw) && raw.length > 3 ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : raw;
      return {
        type: "counter",
        label: normalizeSpace(scope.find(".elementor-counter-title").text()),
        value,
        prefix: normalizeSpace(scope.find(".elementor-counter-number-prefix").text()),
        suffix: normalizeSpace(scope.find(".elementor-counter-number-suffix").text()),
      };
    }
    case "accordion":
    case "toggle": {
      const items = scope
        .find(".elementor-accordion-item, .elementor-toggle-item")
        .map((_, item) => {
          const q = normalizeSpace(
            $(item).find(".elementor-accordion-title, .elementor-toggle-title").first().text(),
          );
          const content = $(item).find(".elementor-tab-content").first();
          return { question: q, answer: content.length ? parseRichBlocks($, content[0]!) : [] };
        })
        .get()
        .filter((i) => i.question);
      return items.length ? { type: "faq", items } : null;
    }
    case "image-box":
    case "icon-box": {
      const titleEl = scope.find(".elementor-image-box-title, .elementor-icon-box-title").first();
      const descEl = scope.find(".elementor-image-box-description, .elementor-icon-box-description").first();
      const title = normalizeSpace(titleEl.text());
      const iconClass = scope.find(".elementor-icon i, .elementor-icon svg").attr("class") || null;
      const href = titleEl.find("a").attr("href") || scope.find("a").attr("href");
      return {
        type: "box",
        image: type === "image-box" ? imageFrom($, scope.find("img")[0]) : null,
        icon: iconClass,
        title,
        description: descEl.length ? toInline($, descEl[0]!) : "",
        href: href ? rewriteSourceHref(href) : null,
      };
    }
    case "icon-list": {
      const items = scope
        .find(".elementor-icon-list-item")
        .map((_, li) => {
          const a = $(li).find("a").attr("href");
          return {
            label: normalizeSpace($(li).find(".elementor-icon-list-text").text() || $(li).text()),
            href: a ? rewriteSourceHref(a) : null,
          };
        })
        .get()
        .filter((i) => i.label);
      return items.length ? { type: "iconList", items } : null;
    }
    case "image-carousel": {
      const seen = new Set<string>();
      const images = scope
        .find("img")
        .map((_, img) => imageFrom($, img))
        .get()
        .filter((i): i is SourceImage => {
          if (!i || seen.has(i.src)) return false;
          seen.add(i.src);
          return true;
        });
      return images.length ? { type: "carousel", images } : null;
    }
    case "google_maps": {
      const iframe = scope.find("iframe");
      const src = iframe.attr("src");
      return src ? { type: "map", src, title: iframe.attr("title") || "מפה" } : null;
    }
    case "html": {
      if (scope.find(".express-hovalot-calculator-container, #hovalot-estimate-form").length) return { type: "calculator" };
      const table = scope.find("table")[0];
      if (table) return { type: "table", table: parseTable($, table) };
      const blocks = parseRichBlocks($, scope[0]!);
      return blocks.length ? { type: "text", blocks } : null;
    }
    case "shortcode": {
      if (/Google/.test(scope.text()) && /ביקורות/.test(scope.text())) return { type: "reviews" };
      const blocks = parseRichBlocks($, scope[0]!);
      return blocks.length ? { type: "text", blocks } : null;
    }
    case "price-list": {
      const items = scope
        .find(".elementor-price-list-item")
        .map((_, li) => ({
          title: normalizeSpace($(li).find(".elementor-price-list-title").text()),
          price: normalizeSpace($(li).find(".elementor-price-list-price").text()),
          description: normalizeSpace($(li).find(".elementor-price-list-description").text()),
        }))
        .get();
      return items.length ? { type: "priceList", items } : null;
    }
    case "video": {
      const overlay = scope.find("[data-elementor-lightbox]").attr("data-elementor-lightbox");
      let url = "";
      try {
        url = overlay ? (JSON.parse(overlay) as { url?: string }).url || "" : "";
      } catch {
        url = "";
      }
      if (!url) {
        const settings = $(el).attr("data-settings");
        const m = settings?.match(/"youtube_url":"([^"]+)"/);
        if (m) url = m[1]!.replace(/\\\//g, "/");
      }
      if (!url) return null;
      return { type: "video", url, poster: imageFrom($, scope.find("img")[0]) };
    }
    case "sitemap": {
      const groups = scope
        .find(".elementor-sitemap-section")
        .map((_, s) => ({
          title: normalizeSpace($(s).find(".elementor-sitemap-title").first().text()),
          links: $(s)
            .find("a")
            .map((__, a) => ({ href: rewriteSourceHref($(a).attr("href")), label: normalizeSpace($(a).text()) }))
            .get()
            .filter((l: ContentLink) => l.label && l.href),
        }))
        .get();
      return groups.length ? { type: "sitemap", groups } : null;
    }
    case "posts":
      return { type: "posts" };
    case "form":
      return { type: "form" };
    default:
      return null;
  }
}

function nearestColumn($: $Api, el: Element): Element | undefined {
  return $(el).parent().closest('[data-element_type="column"], [data-element_type="container"]')[0] as
    | Element
    | undefined;
}

function parseColumn($: $Api, col: Element): SourceColumn {
  const items: SourceNode[] = [];
  $(col)
    .find('[data-element_type="widget"], [data-element_type="section"]')
    .each((_, el) => {
      if (nearestColumn($, el as Element) !== col) return;
      if ($(el).attr("data-element_type") === "section") {
        items.push({ type: "row", columns: columnsOf($, el as Element) });
        return;
      }
      const w = parseWidget($, el as Element);
      if (w) items.push(w);
    });
  return { items };
}

function columnsOf($: $Api, section: Element): SourceColumn[] {
  return $(section)
    .find('[data-element_type="column"]')
    .filter((_, c) => $(c).closest('[data-element_type="section"]')[0] === section)
    .map((_, c) => parseColumn($, c as Element))
    .get()
    .filter((c: SourceColumn) => c.items.length);
}

/** Desktop-visible Elementor section tree for a production page. */
export function parseElementorSections(contentHtml: string): SourceSection[] {
  const $ = cheerio.load(contentHtml || "");
  $(".elementor-hidden-desktop").remove();
  $("script, style, noscript").remove();

  const tops = $('[data-element_type="section"]').filter(
    (_, s) => $(s).parent().closest('[data-element_type="section"]').length === 0,
  );

  if (!tops.length) {
    const blocks = parseRichBlocks($, $.root()[0]!);
    return blocks.length ? [{ index: 0, columns: [{ items: [{ type: "text", blocks }] }] }] : [];
  }

  return tops
    .map((i, s) => ({ index: i, columns: columnsOf($, s as Element) }))
    .get()
    .filter((s: SourceSection) => s.columns.length);
}
