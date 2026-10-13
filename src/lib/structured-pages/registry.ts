import aboutUs from "@/content/structured/about-us.json";
import movingApartment from "@/content/structured/הובלת-דירה-בירושלים.json";
import storagePallets from "@/content/structured/אחסון-משטחים.json";
import storageShort from "@/content/structured/אחסון-תכולה-לטווח-קצר.json";
import contact from "@/content/structured/צרו-קשר.json";
import faq from "@/content/structured/שאלות-נפוצות.json";
import quote from "@/content/structured/הצעת-מחיר.json";
import { normalizePathname } from "@/lib/paths";
import { prepareStructuredPage } from "@/lib/structured-pages/deduplicate-blocks";
import { normalizeStructuredMedia } from "@/lib/structured-pages/normalize-media";
import type { StructuredPageData } from "@/lib/structured-pages/types";

/** Reference pages with production-derived structure */
export const STRUCTURED_REFERENCE_PATHS = new Set([
  "/about-us",
  "/הובלת-דירה-בירושלים",
  "/אחסון-תכולה-לטווח-קצר",
  "/אחסון-משטחים",
  "/צרו-קשר",
  "/שאלות-נפוצות",
  "/הצעת-מחיר",
]);

const pages: StructuredPageData[] = [
  aboutUs as StructuredPageData,
  movingApartment as StructuredPageData,
  storageShort as StructuredPageData,
  storagePallets as StructuredPageData,
  contact as StructuredPageData,
  faq as StructuredPageData,
  quote as StructuredPageData,
];

const byPath = new Map(pages.map((p) => [normalizePathname(p.path), p]));

export function getStructuredPage(path: string): StructuredPageData | null {
  const raw = byPath.get(normalizePathname(path));
  if (!raw) return null;
  return prepareStructuredPage(normalizeStructuredMedia(raw as StructuredPageData));
}

export function isStructuredReferencePage(path: string): boolean {
  return STRUCTURED_REFERENCE_PATHS.has(normalizePathname(path));
}
