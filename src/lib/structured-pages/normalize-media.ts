import { wpUrlToLocal } from "@/lib/media";
import type { StructuredBlock, StructuredPageData } from "@/lib/structured-pages/types";

function normalizeImage(src: string | null | undefined): string | null {
  if (!src) return null;
  const local = wpUrlToLocal(src);
  if (!local || local.includes("/wp-content/uploads/")) return null;
  return local;
}

function normalizeBlock(block: StructuredBlock): StructuredBlock {
  switch (block.type) {
    case "featureGrid":
    case "storageSolutionsGrid":
      return {
        ...block,
        cards: block.cards.map((c) => ({
          ...c,
          image: normalizeImage(c.image),
        })),
      };
    case "imageText":
      return { ...block, image: normalizeImage(block.image) };
    case "iconFeatureGrid":
      return {
        ...block,
        items: block.items.map((i) => ({ ...i, icon: normalizeImage(i.icon) })),
      };
    case "logoGrid":
      return {
        ...block,
        logos: block.logos
          .map((l) => ({ ...l, src: normalizeImage(l.src) || l.src }))
          .filter((l) => l.src && !l.src.includes("/wp-content/")),
      };
    default:
      return block;
  }
}

export function normalizeStructuredMedia(data: StructuredPageData): StructuredPageData {
  return {
    ...data,
    hero: {
      ...data.hero,
      image: normalizeImage(data.hero.image),
    },
    blocks: data.blocks.map(normalizeBlock),
  };
}
