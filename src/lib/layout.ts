/**
 * Inner-page responsive layout system — Phase 2B.3E / 2B.3F
 */

/** Page shell max-widths */
export const layoutWidth = {
  /** ~1440px — outer page shell */
  wide: "max-w-[90rem]",
  /** ~1240px — standard inner sections */
  standard: "max-w-[77.5rem]",
  /** ~1000px — FAQ, conversion, structured blocks */
  content: "max-w-[62.5rem]",
  /** ~816px — readable prose */
  prose: "max-w-[51rem]",
  /** ~1152px — wide prose / intro copy */
  proseWide: "max-w-[72rem]",
} as const;

/** Header uses full viewport width — wider than page content (~1800px) */
export const headerWidth = "max-w-[1800px]";

/** Horizontal page padding — mobile nearly full viewport minus ~32–40px */
export const pagePadding = "px-4 sm:px-5 lg:px-8" as const;

/** Header horizontal padding — scales with viewport */
export const headerPadding = "px-[clamp(1rem,2vw,2rem)]";

/** Sidebar column for article layout */
export const sidebarWidth = "minmax(280px, 330px)" as const;

/** Vertical section padding scale */
export const sectionPad = {
  compact: "py-10 sm:py-12 lg:py-14",
  normal: "py-11 sm:py-14 lg:py-[4.5rem]",
  tight: "py-8 sm:py-10 lg:py-12",
  /** Final CTA — slightly more presence */
  cta: "py-12 sm:py-16 lg:py-20",
} as const;

/** Inner-page Hero vertical rhythm */
export const heroPad = {
  standard: "py-9 sm:py-11 lg:py-[3.25rem]",
  rich: "py-10 sm:py-12 lg:py-16",
} as const;

/** Responsive grid presets */
export const gridClass = {
  feature: "grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3",
  iconFeature: "grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  logo: "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6",
  profile: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
  split: "grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12",
} as const;

/** Fixed responsive wrappers for media roles */
export const mediaRoleClass = {
  icon: "media-role-icon",
  logo: "media-role-logo",
  avatar: "media-role-avatar",
  card: "media-role-card",
  contentMedium: "media-role-content-medium",
  contentWide: "media-role-content-wide",
  hero: "media-role-hero",
} as const;

export const iconCellClass =
  "relative mx-auto mb-3 h-12 w-12 sm:mx-0 sm:mb-4 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0";

export const logoCellClass =
  "flex h-[4.5rem] items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 p-2.5 sm:h-20 sm:p-3";

export const logoImageClass =
  "max-h-[3.125rem] w-auto max-w-full object-contain sm:max-h-14 lg:max-h-16";
