/**
 * Shared UI tokens — radius, motion, interactive surfaces (Phase 2A.8 / 2A.10)
 */

/** Border-radius hierarchy — buttons 14–16px per Phase 2A.10 */
export const radius = {
  button: "rounded-[14px]",
  card: "rounded-xl",
  panel: "rounded-2xl",
  input: "rounded-[10px]",
} as const;

/** Standard interactive transition — respects reduced motion via Tailwind variants */
export const motion = {
  interactive:
    "transition-[color,background-color,border-color,box-shadow,transform] duration-200 motion-reduce:transition-none motion-reduce:hover:transform-none",
  card: "transition-[box-shadow,border-color,transform] duration-200 motion-reduce:transition-none motion-reduce:hover:transform-none",
} as const;

/** Shared section H2 visual (semantic level stays at call site) */
export const sectionTitleClass = "text-2xl font-bold text-brand-800 sm:text-3xl";
