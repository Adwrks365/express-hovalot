import { htmlToPlainText } from "@/lib/wp-html";
import type { CompositionBlock } from "@/lib/page-composition/types";

/** Trigger remaining-content fallback below this ratio (Phase 2B.4D pass target: ≥ 0.95). */
export const COVERAGE_THRESHOLD = 0.95;

/** Normalize visible text for parity comparison (whitespace + case). */
export function normalizeVisibleText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function textFromBlock(block: CompositionBlock): string {
  switch (block.type) {
    case "prose":
    case "remaining":
      return htmlToPlainText(block.html);
    case "imageText":
      return htmlToPlainText(block.html);
    case "benefitGrid":
      return (block.heading || "") + block.items.map((i) => `${i.title} ${i.description}`).join(" ");
    case "featureGrid":
      return (
        htmlToPlainText(block.introHtml || "") +
        (block.heading || "") +
        block.cards.map((c) => `${c.title} ${htmlToPlainText(c.descriptionHtml)}`).join(" ")
      );
    case "areaLinks":
      return block.heading + block.links.map((l) => l.label).join(" ");
    case "logoGrid":
      return (block.heading || "") + block.logos.map((l) => l.alt).join(" ");
    case "faq":
      return (
        htmlToPlainText(block.introHtml || "") +
        block.items.map((i) => `${i.question} ${i.answer}`).join(" ")
      );
    case "ctaTop":
      return block.heading || "";
    default:
      return "";
  }
}

/**
 * Word-overlap coverage: share of source tokens (len>2) found in parsed output.
 * More reliable than raw char count for Hebrew + template duplicates.
 */
export function computeCoverageRatio(
  sourceHtml: string,
  introHtml: string | null,
  blocks: CompositionBlock[],
): number {
  const source = normalizeVisibleText(htmlToPlainText(sourceHtml));
  if (!source.length) return 1;

  const covered = normalizeVisibleText(
    htmlToPlainText(introHtml || "") + blocks.map(textFromBlock).join(" "),
  );

  const sourceWords = [...new Set(source.split(" ").filter((w) => w.length > 2))];
  if (!sourceWords.length) return 1;

  const coveredTokens = new Set(covered.split(" "));
  let matched = 0;
  for (const word of sourceWords) {
    if (coveredTokens.has(word)) matched++;
  }
  return matched / sourceWords.length;
}

export function countHeadings(html: string): { h2: number; h3: number } {
  const h2 = (html.match(/<h2\b/gi) || []).length;
  const h3 = (html.match(/<h3\b/gi) || []).length;
  return { h2, h3 };
}

export function countImages(html: string): number {
  return (html.match(/<img\b/gi) || []).length;
}
