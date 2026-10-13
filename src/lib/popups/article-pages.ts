import categoriesData from "@/content/data/categories.json";
import type { PopupContextType } from "@/lib/popups/types";

type WpCategory = { id: number; slug: string; name: string };

const categories = (categoriesData as { categories: WpCategory[] }).categories;

function categoryNames(ids: number[] | undefined): string[] {
  if (!ids?.length) return [];
  const byId = new Map(categories.map((c) => [c.id, c.name]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as string[];
}

function scoreContext(blob: string): PopupContextType | null {
  if (/מחיר|עלות|מחירון/.test(blob)) return "price-quote";
  if (/אחסון|אחסנה/.test(blob)) return "storage";
  if (/אריז/.test(blob)) return "packing";
  if (/משרד/.test(blob)) return "office-moving";
  if (/מנוף|מורכב|פסנתר/.test(blob)) return "crane-special";
  if (/קטנ|פריט|רהיט/.test(blob)) return "small-moves";
  if (/דירה|מעבר\s*דירה/.test(blob)) return "apartment-moving";
  if (/ירושלים|אזור|שכונה|עיר/.test(blob)) return "jerusalem-area";
  return null;
}

export function resolveArticlePopupContext(input: {
  title: string;
  slug: string;
  categories?: number[];
}): PopupContextType {
  const cats = categoryNames(input.categories).join(" ");
  const blob = `${input.title} ${input.slug} ${cats}`.toLowerCase();
  return scoreContext(blob) ?? "moving-general";
}
