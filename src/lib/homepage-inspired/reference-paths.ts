/** Phase 2B.6 — first-pass reference pages (homepage design language). */
export const PHASE_2B6_REFERENCE_PATHS = [
  "/הובלת-דירה-בירושלים",
  "/הובלות-משרדים-בירושלים",
  "/אחסון-משטחים",
  "/אחסון-תכולה-לטווח-קצר",
  "/הובלות-בגבעת-זאב",
  "/about-us",
  "/שאלות-נפוצות",
  "/צרו-קשר",
  "/מעבר-דירה-בירושלים",
  "/הצעת-מחיר",
] as const;

export function normalizeContentPath(path: string): string {
  if (path.endsWith("/") && path.length > 1) return path.slice(0, -1);
  return path;
}

export function isHomepageInspiredReferencePath(path: string): boolean {
  const normalized = normalizeContentPath(path);
  return (PHASE_2B6_REFERENCE_PATHS as readonly string[]).includes(normalized);
}
