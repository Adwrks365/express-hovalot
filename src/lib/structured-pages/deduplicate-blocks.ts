import { isGlobalCtaText, isGlobalFooterFormText } from "@/content/migration/global-template-filter";
import type { StructuredBlock, StructuredPageData } from "@/lib/structured-pages/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hashText(text: string): string {
  return stripHtml(text).slice(0, 240).toLowerCase();
}

function cardKey(title: string, descriptionHtml: string): string {
  return `${title.trim().toLowerCase()}|${hashText(descriptionHtml)}`;
}

function faqKey(items: { question: string }[]): string {
  return items.map((i) => i.question.trim()).join("|");
}

function isPhoneOnlyRichText(html: string): boolean {
  const text = stripHtml(html);
  if (!text) return true;
  const phoneOnly =
    /^(חייגו|התקשרו|טלפון)/i.test(text) &&
    text.length < 120 &&
    (text.includes("052") || text.includes("חייגו"));
  return phoneOnly;
}

function isDuplicateCtaRichText(html: string): boolean {
  const text = stripHtml(html);
  return isGlobalCtaText(text) || /^חייגו עכשיו/i.test(text);
}

function mergeFeatureGrids(blocks: StructuredBlock[]): StructuredBlock[] {
  const out: StructuredBlock[] = [];
  let mergedCards: StructuredBlock | null = null;

  for (const block of blocks) {
    if (block.type === "featureGrid" || block.type === "storageSolutionsGrid") {
      if (!mergedCards) {
        mergedCards = { ...block, cards: [...block.cards] };
        out.push(mergedCards);
        continue;
      }
      const seen = new Set(mergedCards.cards.map((c) => cardKey(c.title, c.descriptionHtml)));
      for (const card of block.cards) {
        const key = cardKey(card.title, card.descriptionHtml);
        if (!seen.has(key)) {
          mergedCards.cards.push(card);
          seen.add(key);
        }
      }
      if (!mergedCards.title && block.title) mergedCards.title = block.title;
      if (!mergedCards.introHtml && block.introHtml) mergedCards.introHtml = block.introHtml;
      continue;
    }
    mergedCards = null;
    out.push(block);
  }
  return out;
}

export function deduplicateStructuredBlocks(
  blocks: StructuredBlock[],
  pagePath: string,
): StructuredBlock[] {
  const seenFaq = new Set<string>();
  const seenStats = new Set<string>();
  const seenForm = new Set<string>();
  const seenRich = new Set<string>();
  let conversionSeen = false;

  const filtered = blocks.filter((block) => {
    if (block.type === "faq") {
      const key = faqKey(block.items);
      if (seenFaq.has(key)) return false;
      seenFaq.add(key);
      return block.items.length > 0;
    }

    if (block.type === "stats") {
      const key = block.items.map((i) => i.label).join("|");
      if (seenStats.has(key)) return false;
      seenStats.add(key);
      const brokenCounters = block.items.every((i) => /0\s*\+|% 0/.test(i.label));
      if (brokenCounters) return false;
      return true;
    }

    if (block.type === "formBlock") {
      const body = hashText(block.bodyHtml || block.title || "");
      if (seenForm.has(body)) return false;
      if (isGlobalFooterFormText(stripHtml(block.bodyHtml || block.title || ""))) return false;
      seenForm.add(body);
      return true;
    }

    if (block.type === "ctaStrip") {
      if (conversionSeen || pagePath === "/שאלות-נפוצות") return false;
      return true;
    }

    if (block.type === "conversionSection") {
      if (conversionSeen) return false;
      conversionSeen = true;
      return true;
    }

    if (block.type === "richText") {
      const key = hashText(block.html);
      if (seenRich.has(key)) return false;
      if (isPhoneOnlyRichText(block.html)) return false;
      if (isDuplicateCtaRichText(block.html)) return false;
      seenRich.add(key);
      return stripHtml(block.html).length > 0;
    }

    return true;
  });

  return mergeFeatureGrids(filtered);
}

export function prepareStructuredPage(data: StructuredPageData): StructuredPageData {
  return {
    ...data,
    blocks: deduplicateStructuredBlocks(data.blocks, data.path),
  };
}
