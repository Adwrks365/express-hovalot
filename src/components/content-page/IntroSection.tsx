import { RichText } from "@/components/internal/RichText";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { layoutWidth } from "@/lib/layout";

export function IntroSection({ html, tone = "white" }: { html: string; tone?: SectionTone }) {
  return (
    <SectionShell tone={tone} pad="compact">
      <ScrollReveal variant="subtle">
        <div className={`mx-auto w-full min-w-0 ${layoutWidth.proseWide}`}>
          <RichText html={html} variant="wide" animate={false} />
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
