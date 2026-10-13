import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { ProseBody } from "@/components/structured-content/ProseBody";
import { SectionIntro } from "@/components/structured-content/SectionIntro";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { layoutWidth } from "@/lib/layout";
import type { ContentLink, ProseContent } from "@/lib/structured-content/types";

export function ProseSection({
  heading,
  body,
  links = [],
  tone = "white",
  animate = true,
}: {
  heading?: string | null;
  body: ProseContent;
  links?: ContentLink[];
  tone?: SectionTone;
  animate?: boolean;
}) {
  const inner = (
    <div className={`mx-auto w-full min-w-0 ${layoutWidth.proseWide}`}>
      <SectionIntro heading={heading} intro={null} />
      <div className={`mx-auto ${layoutWidth.prose}`}>
        <ProseBody content={body} links={links} />
      </div>
    </div>
  );

  return (
    <SectionShell tone={tone}>
      {animate ? <ScrollReveal variant="subtle">{inner}</ScrollReveal> : inner}
    </SectionShell>
  );
}
