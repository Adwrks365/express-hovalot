import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/constants";
import type { CtaButton } from "@/lib/redesign/blocks";
import type { RedesignArchetype } from "@/lib/redesign/archetype";
import { normalizeRedesignPath } from "@/lib/redesign/archetype";

export function shouldShowHeroForm(archetype: RedesignArchetype, path: string): boolean {
  const p = normalizeRedesignPath(path);
  if (archetype === "contact" || archetype === "legal" || archetype === "utility") return false;
  if (p === "/הצעת-מחיר") return false;
  return ["service", "area", "storage", "about", "faq", "information", "quote"].includes(archetype);
}

export function heroFormCopy(archetype: RedesignArchetype): { heading: string; supporting: string } {
  switch (archetype) {
    case "area":
      return {
        heading: "צריכים הובלה באזור?",
        supporting: "השאירו פרטים ונחזור אליכם בהקדם.",
      };
    case "storage":
      return {
        heading: "צריכים פתרון אחסון?",
        supporting: "השאירו פרטים ונחזור אליכם בהקדם.",
      };
    default:
      return {
        heading: "נשמח לעמוד לשירותכם",
        supporting: "השאירו פרטים ונחזור אליכם בהקדם.",
      };
  }
}

/** One phone action + hero form — no duplicate quote CTAs. */
export function normalizeHeroButtonsWithForm(buttons: CtaButton[]): CtaButton[] {
  const withoutConversion = buttons.filter(
    (b) => b.kind !== "quote" && b.kind !== "contact" && !(b.kind === "link" && b.href.includes("#contact")),
  );
  const phone = withoutConversion.find((b) => b.kind === "phone");
  if (phone) return [phone];
  return [{ kind: "phone", label: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` }];
}
