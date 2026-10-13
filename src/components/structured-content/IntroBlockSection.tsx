import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { ProseBody } from "@/components/structured-content/ProseBody";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { layoutWidth } from "@/lib/layout";
import type { ProseContent } from "@/lib/structured-content/types";

export function IntroBlockSection({ intro, tone = "white" }: { intro: ProseContent; tone?: SectionTone }) {
  return (
    <SectionShell tone={tone} pad="compact">
      <Container width="standard">
        <ScrollReveal variant="subtle">
          <div className={`mx-auto w-full ${layoutWidth.proseWide} text-center`}>
            <div className={`mx-auto ${layoutWidth.prose} text-start`}>
              <ProseBody content={intro} variant="intro" />
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </SectionShell>
  );
}
