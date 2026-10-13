/**
 * Page archetype classification — Phase 2B.3F
 * Maps migrated URLs to shared renderers while preserving unique content per page.
 */

export type PageArchetype =
  | "SERVICE_LANDING"
  | "STORAGE_SERVICE"
  | "MOVING_SERVICE"
  | "PACKING_SERVICE"
  | "AREA_PAGE"
  | "PRICING_PAGE"
  | "ABOUT"
  | "CONTACT"
  | "FAQ"
  | "ARTICLE"
  | "ARCHIVE"
  | "STANDARD_INFORMATION";

/** Reference pages with curated structured JSON */
export const STRUCTURED_REFERENCE_ARCHETYPES: Record<string, PageArchetype> = {
  "/about-us": "ABOUT",
  "/הובלת-דירה-בירושלים": "MOVING_SERVICE",
  "/אחסון-תכולה-לטווח-קצר": "STORAGE_SERVICE",
  "/אחסון-משטחים": "STORAGE_SERVICE",
  "/צרו-קשר": "CONTACT",
  "/שאלות-נפוצות": "FAQ",
  "/הצעת-מחיר": "PRICING_PAGE",
};

export function classifyPageArchetype(path: string, contentType?: string): PageArchetype {
  const normalized = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;

  if (STRUCTURED_REFERENCE_ARCHETYPES[normalized]) {
    return STRUCTURED_REFERENCE_ARCHETYPES[normalized];
  }

  if (normalized === "/blog") return "ARCHIVE";
  if (contentType === "post") return "ARTICLE";
  if (normalized === "/about-us") return "ABOUT";
  if (normalized === "/הצעת-מחיר" || normalized === "/מחירי-הובלת-דירות") return "PRICING_PAGE";
  if (normalized === "/שאלות-נפוצות") return "FAQ";
  if (normalized === "/צרו-קשר") return "CONTACT";

  if (/^\/הובלות-ב[^/]+/.test(normalized) && normalized !== "/הובלות-בירושלים") {
    return "AREA_PAGE";
  }

  if (/אחסון|מחסן|משטח/.test(normalized)) return "STORAGE_SERVICE";
  if (/אריזה|אריז/.test(normalized)) return "PACKING_SERVICE";
  if (/הובל|משרד|מוביל|משטח|מנוף/.test(normalized)) return "MOVING_SERVICE";

  return "STANDARD_INFORMATION";
}

export function usesStructuredRenderer(archetype: PageArchetype): boolean {
  return (
    archetype === "ABOUT" ||
    archetype === "STORAGE_SERVICE" ||
    archetype === "CONTACT" ||
    archetype === "FAQ" ||
    archetype === "PRICING_PAGE"
  );
}
