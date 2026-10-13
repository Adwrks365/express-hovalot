import { FaqAccordion } from "@/components/content/FaqAccordion";
import { RichText } from "@/components/internal/RichText";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FaqSectionBlock({
  introHtml,
  items,
  title,
  tone = "white",
  showHeading = true,
}: {
  introHtml?: string | null;
  items: { question: string; answer: string }[];
  title?: string | null;
  tone?: SectionTone;
  showHeading?: boolean;
}) {
  return (
    <div data-faq-group>
      <SectionShell tone={tone}>
        {showHeading && title ? (
          <SectionHeading title={title} align="start" className="mb-6" />
        ) : null}
        {introHtml ? (
          <div className="mb-6 w-full min-w-0 sm:mb-8">
            <RichText html={introHtml} variant="wide" animate={false} />
          </div>
        ) : null}
        <div className="w-full min-w-0">
          <FaqAccordion items={items} />
        </div>
      </SectionShell>
    </div>
  );
}
