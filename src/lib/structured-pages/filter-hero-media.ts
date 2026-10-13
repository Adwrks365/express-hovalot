import type { StructuredBlock } from "@/lib/structured-pages/types";

function normalizeMediaPath(path: string): string {
  try {
    const decoded = decodeURIComponent(path);
    return decoded.split("/").pop()?.toLowerCase() || decoded.toLowerCase();
  } catch {
    return path.split("/").pop()?.toLowerCase() || path.toLowerCase();
  }
}

/** Strip hero image from first body block when the same asset would render twice */
export function filterHeroDuplicateMedia(
  blocks: StructuredBlock[],
  heroImage: string | null | undefined,
): StructuredBlock[] {
  if (!heroImage) return blocks;
  const heroKey = normalizeMediaPath(heroImage);
  let stripped = false;

  return blocks.map((block) => {
    if (stripped || block.type !== "imageText" || !block.image) return block;
    const blockKey = normalizeMediaPath(block.image);
    if (blockKey !== heroKey) return block;

    stripped = true;
    return { ...block, image: null, imageAlt: undefined };
  });
}

export function collectBlockMediaPaths(block: StructuredBlock): string[] {
  switch (block.type) {
    case "imageText":
      return block.image ? [block.image] : [];
    case "featureGrid":
    case "storageSolutionsGrid":
      return block.cards.map((c) => c.image).filter(Boolean) as string[];
    case "logoGrid":
      return block.logos.map((l) => l.src);
    default:
      return [];
  }
}
