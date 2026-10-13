import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import type { CtaButton, FaqEntry } from "@/lib/redesign/blocks";
import { buttonFrom } from "@/lib/redesign/compose";
import { inlineToText, normalizeSpace, parseRichBlocks, rewriteSourceHref } from "@/lib/redesign/parse-elementor";
import type { RichBlock } from "@/lib/redesign/types";

export type ArticlePart =
  | { kind: "rich"; blocks: RichBlock[] }
  | { kind: "heading"; level: 2 | 3 | 4; html: string; id: string | null }
  | { kind: "buttons"; buttons: CtaButton[] }
  | { kind: "faq"; items: FaqEntry[] };

export type ArticleTocEntry = { id: string; text: string; level: 2 | 3 };

function headingId(text: string, used: Set<string>): string {
  const base = text.replace(/\s+/g, "-").replace(/[^\w\u0590-\u05FF-]+/g, "").slice(0, 80) || "section";
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

/** Splits article HTML into ordered editorial parts (prose, headings, CTA buttons, FAQ). */
export function parseArticleBody(
  html: string,
  { title, featuredImage }: { title: string; featuredImage: string | null },
): { parts: ArticlePart[]; toc: ArticleTocEntry[] } {
  const $ = cheerio.load(`<div id="article-root">${html}</div>`);
  $(".elementor-hidden-desktop, style, script, form, iframe, noscript").remove();
  const root = $("#article-root");
  const firstH1 = root.find("h1").first();
  if (firstH1.length && normalizeSpace(firstH1.text()) === normalizeSpace(title)) firstH1.remove();

  const parts: ArticlePart[] = [];
  const toc: ArticleTocEntry[] = [];
  const used = new Set<string>();
  let lastLevel = 1;

  const pushRich = (blocks: RichBlock[]) => {
    for (const b of blocks) {
      if (b.kind === "h") {
        const text = inlineToText(b.html);
        const sourceLevel = b.level <= 2 ? 2 : b.level === 3 ? 3 : 4;
        const level = Math.min(sourceLevel, lastLevel + 1) as 2 | 3 | 4;
        lastLevel = level;
        const id = level <= 3 ? headingId(text, used) : null;
        if (id) toc.push({ id, text, level: level as 2 | 3 });
        parts.push({ kind: "heading", level, html: b.html, id });
        continue;
      }
      const last = parts[parts.length - 1];
      if (last?.kind === "rich") last.blocks.push(b);
      else parts.push({ kind: "rich", blocks: [b] });
    }
  };

  const pushButtons = (buttons: CtaButton[]) => {
    const last = parts[parts.length - 1];
    const group = last?.kind === "buttons" ? last : null;
    const target = group ?? { kind: "buttons" as const, buttons: [] as CtaButton[] };
    for (const b of buttons) {
      if (!target.buttons.some((x) => x.label === b.label && x.href === b.href)) target.buttons.push(b);
    }
    if (!group && target.buttons.length) parts.push(target);
  };

  const widgets = root.find(".elementor-widget");
  if (!widgets.length) {
    pushRich(parseRichBlocks($, root[0] as AnyNode));
  } else {
    widgets.each((_, el) => {
      const $el = $(el);
      if ($el.hasClass("elementor-widget-button")) {
        const buttons = $el
          .find("a[href]")
          .map((__, a) => {
            const label = normalizeSpace($(a).text());
            const href = rewriteSourceHref($(a).attr("href"));
            return label && href ? buttonFrom(label, href) : null;
          })
          .get()
          .filter((b): b is CtaButton => Boolean(b));
        pushButtons(buttons);
        return;
      }
      const faqItems = $el.find(".faq-item");
      if (faqItems.length) {
        const items: FaqEntry[] = faqItems
          .map((__, item) => {
            const q = $(item).find(".faq-question").first().clone();
            q.find(".faq-icon").remove();
            const answer = $(item).find(".faq-answer").first();
            return { question: normalizeSpace(q.text()), answer: answer.length ? parseRichBlocks($, answer[0] as AnyNode) : [] };
          })
          .get()
          .filter((x) => x.question);
        if (items.length) parts.push({ kind: "faq", items });
        return;
      }
      pushRich(parseRichBlocks($, el as AnyNode));
    });
  }

  const first = parts[0];
  if (featuredImage && first?.kind === "rich" && first.blocks[0]?.kind === "img" && first.blocks[0].src === featuredImage) {
    first.blocks.shift();
    if (!first.blocks.length) parts.shift();
  }

  return { parts, toc };
}
