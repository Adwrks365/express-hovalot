/**
 * Elementor / WordPress global template fingerprints.
 * Sections matching these patterns are already rendered via shared Next.js
 * Header, Footer, or sitewide components — exclude from page body composition.
 */

/** Elementor section data-id values reused across many pages (global templates) */
export const GLOBAL_ELEMENTOR_SECTION_IDS = new Set([
  "kpt7ol5", // homepage hero slideshow injected into many pages
]);

/** Widget / section kinds that belong in footer globally, not page body */
export const GLOBAL_SECTION_KINDS = new Set(["footer", "header"]);

/** Hebrew copy fingerprints of sitewide footer lead forms */
export const GLOBAL_FORM_FINGERPRINTS = [
  "צריכים הובלה בירושלים והסביבה",
  "השאירו פרטים ונחזור אליכם",
];

/** CTA text that repeats from global templates when adjacent to footer form */
export const GLOBAL_CTA_FINGERPRINTS = ["חייגו עכשיו וקבלו מענה מיידי", "רוצים לקבל הצעת מחיר מהירה"];

export type GlobalFilterContext = {
  path: string;
  sectionIndex?: number;
  elementorSectionId?: string | null;
  kind?: string | null;
  normalizedText?: string;
};

export function isGlobalTemplateSection(ctx: GlobalFilterContext): boolean {
  if (ctx.elementorSectionId && GLOBAL_ELEMENTOR_SECTION_IDS.has(ctx.elementorSectionId)) {
    return true;
  }
  if (ctx.kind && GLOBAL_SECTION_KINDS.has(ctx.kind)) return true;
  return false;
}

export function isGlobalFooterFormText(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  return GLOBAL_FORM_FINGERPRINTS.some((fp) => t.includes(fp));
}

export function isGlobalCtaText(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  return GLOBAL_CTA_FINGERPRINTS.some((fp) => t.includes(fp));
}
