import { FaqAccordion } from "@/components/content/FaqAccordion";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionIntro } from "@/components/structured-content/SectionIntro";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { ContentWidth } from "@/components/ui/ContentWidth";
import type { FaqItem } from "@/components/content/FaqAccordion";
import type { ProseContent } from "@/lib/structured-content/types";

export function StructuredFaqSection({
  heading,
  intro,
  items,
  tone = "white",
}: {
  heading?: string | null;
  intro?: ProseContent | null;
  items: FaqItem[];
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone}>
      <Container width="standard">
        <ContentWidth>
          <ScrollReveal variant="heading">
            <SectionIntro heading={heading} intro={intro} />
          </ScrollReveal>
          <FaqAccordion items={items} />
        </ContentWidth>
      </Container>
    </SectionShell>
  );
}
