import type { PageModel } from "@/lib/redesign/blocks";

export type RedesignArchetype =
  | "service"
  | "area"
  | "storage"
  | "about"
  | "contact"
  | "faq"
  | "quote"
  | "information"
  | "legal"
  | "utility";

const FIXED: Record<string, RedesignArchetype> = {
  "/about-us": "about",
  "/צרו-קשר": "contact",
  "/שאלות-נפוצות": "faq",
  "/הצעת-מחיר": "quote",
  "/מחירי-הובלת-דירות": "quote",
  "/מחיר-אחסון-תכולה-בירושלים": "quote",
  "/מדריך-מעבר-דירה-ירושלים": "information",
  "/blog": "information",
  "/site-map": "utility",
  "/תודה-רבה": "utility",
  "/דף-נחיתה": "service",
  "/terms-of-use": "legal",
  "/privacy-policy": "legal",
  "/accessibility-statement": "legal",
};

export function normalizeRedesignPath(path: string): string {
  let p = path;
  try {
    p = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

export function resolveRedesignArchetype(path: string, model: PageModel): RedesignArchetype {
  const p = normalizeRedesignPath(path);
  if (FIXED[p]) return FIXED[p];
  if (model.hero.badges.length) return "area";
  if (/אחסון|אחסנה/.test(p)) return "storage";
  return "service";
}
