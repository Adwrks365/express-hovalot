import { isHomepageInspiredReferencePath } from "@/lib/homepage-inspired/reference-paths";

/**
 * Phase 2B.6 — homepage-inspired visual redesign for reference URLs only.
 * Content still comes from production `sanitizedHtml` via composition parser.
 */
export function isHomepageInspiredRedesignEnabled(path: string): boolean {
  if (process.env.NEXT_PUBLIC_HOMEPAGE_INSPIRED === "false") return false;
  return isHomepageInspiredReferencePath(path);
}

/** @deprecated Use `isHomepageInspiredRedesignEnabled` — not a React hook. */
export const useHomepageInspiredRedesign = isHomepageInspiredRedesignEnabled;
