/**
 * Global typography contract — see docs/TYPOGRAPHY.md
 * Semantic level (h1–h4) is chosen at call site; these are visual roles only.
 */

/** Visual scale — responsive sizes for Hebrew (RTL) */
export const typeScale = {
  /** Hero H1 — display ~32px mobile, ~48px desktop */
  heroDisplay:
    "text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-[2.125rem] lg:text-[3rem] lg:leading-[1.12]",
  /** Hero SEO line (semantic h2) — supporting, accent */
  heroSeo: "text-sm font-semibold leading-relaxed sm:text-base",
  /** Hero section line (semantic h2) — services positioning */
  heroSectionLine: "text-xl font-semibold leading-snug sm:text-2xl lg:text-[1.75rem] lg:leading-snug",
  /** Standard page H1 — inner pages */
  pageH1:
    "text-[1.875rem] font-bold leading-[1.2] tracking-tight sm:text-[2.125rem] lg:text-[2.625rem]",
  /** Major section H2 */
  sectionH2:
    "text-2xl font-bold leading-snug sm:text-[1.75rem] lg:text-[2rem] lg:leading-tight",
  /** Subsection H3 */
  subsectionH3: "text-lg font-semibold leading-snug sm:text-xl lg:text-[1.375rem]",
  /** Minor H4 */
  minorH4: "text-base font-semibold leading-normal sm:text-lg",
  /** Body copy */
  body: "text-base leading-[1.75]",
  bodyLg: "text-base leading-[1.75] sm:text-lg",
  /** Supporting / small */
  small: "text-sm leading-relaxed",
  caption: "text-xs leading-snug",
} as const;

/** Foreground on light vs dark/image backgrounds */
export const typeTone = {
  onLight: {
    heading: "text-brand-800",
    body: "text-neutral-700",
    muted: "text-neutral-600",
    accent: "text-brand-600",
  },
  onDark: {
    heading: "text-white",
    body: "text-white/95",
    muted: "text-white/85",
    accent: "text-accent-300",
  },
} as const;

export type TypeTone = keyof typeof typeTone;
