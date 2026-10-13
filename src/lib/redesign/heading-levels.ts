import type { Block, Card, SourceHeading } from "@/lib/redesign/blocks";
import type { RichBlock } from "@/lib/redesign/types";

type Level = 2 | 3 | 4;

/** Rendered levels — must mirror SectionHeader, RichContent and CardTitle. */
const sectionLevel = (h: SourceHeading): Level => h.as ?? (h.level >= 3 ? 3 : 2);
const richLevel = (b: Extract<RichBlock, { kind: "h" }>): Level => b.as ?? (b.level <= 3 ? 3 : 4);
const cardLevel = (c: Card): Level => c.titleAs ?? (c.titleLevel <= 3 ? 3 : 4);

/**
 * Keeps the rendered outline free of skipped levels (h1→h3, h2→h4) without touching heading text:
 * a heading deeper than one level below the previous heading is rendered one level below it.
 */
export function normalizeHeadingLevels(blocks: Block[]): Block[] {
  let last = 1;
  const clamp = (level: Level): Level | null => (level > last + 1 ? ((last + 1) as Level) : null);

  const section = (h: SourceHeading | undefined): SourceHeading | undefined => {
    if (!h) return h;
    const fixed = clamp(sectionLevel(h));
    last = fixed ?? sectionLevel(h);
    return fixed ? { ...h, as: fixed } : h;
  };
  const rich = (body: RichBlock[]): RichBlock[] =>
    body.map((b) => {
      if (b.kind !== "h") return b;
      const fixed = clamp(richLevel(b));
      last = fixed ?? richLevel(b);
      return fixed ? { ...b, as: fixed } : b;
    });
  const cards = (list: Card[]): Card[] =>
    list.map((c) => {
      const fixed = clamp(cardLevel(c));
      return fixed ? { ...c, titleAs: fixed } : c;
    });

  return blocks.map((block): Block => {
    switch (block.type) {
      case "prose":
        return { ...block, heading: section(block.heading), body: rich(block.body) };
      case "split": {
        const heading = section(block.heading);
        return { ...block, heading, body: rich(block.body), features: cards(block.features) };
      }
      case "cards": {
        const heading = section(block.heading);
        const intro = rich(block.intro);
        return { ...block, heading, intro, cards: cards(block.cards) };
      }
      case "stats":
      case "priceList":
      case "calculator":
        return { ...block, heading: section(block.heading), intro: rich(block.intro) } as Block;
      case "faq":
        return { ...block, heading: section(block.heading), intro: rich(block.intro) };
      case "map":
      case "video":
        return { ...block, heading: section(block.heading), body: rich(block.body) } as Block;
      case "cta":
        return { ...block, text: rich(block.text) };
      case "logos":
      case "links":
        return { ...block, heading: section(block.heading) } as Block;
      case "reviews":
      case "posts":
      case "sitemap":
        last = 2;
        return block;
      default:
        return block;
    }
  });
}
