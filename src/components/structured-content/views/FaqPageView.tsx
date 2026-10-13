import { IntroBlockSection } from "@/components/structured-content/IntroBlockSection";
import { StructuredFaqSection } from "@/components/structured-content/StructuredFaqSection";
import { renderStructuredSection } from "@/components/structured-content/render-structured-section";
import type { StructuredPageModel } from "@/lib/structured-content/types";
import type { FaqItem } from "@/components/content/FaqAccordion";

export function FaqPageView({ model }: { model: StructuredPageModel }) {
  const faqSections = model.sections.filter((s) => s.type === "faq");
  const otherSections = model.sections.filter((s) => s.type !== "faq");

  const mergedFaq: FaqItem[] = [];
  let faqHeading: string | null = null;
  for (const s of faqSections) {
    if (s.type !== "faq") continue;
    if (!faqHeading && s.heading) faqHeading = s.heading;
    mergedFaq.push(...s.items);
  }

  return (
    <>
      {model.intro ? <IntroBlockSection intro={model.intro} tone="white" /> : null}
      {otherSections.map((section, index) => renderStructuredSection(section, index))}
      {mergedFaq.length ? (
        <StructuredFaqSection heading={faqHeading || "שאלות נפוצות"} intro={null} items={mergedFaq} tone="white" />
      ) : null}
    </>
  );
}
