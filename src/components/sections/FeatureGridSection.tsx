import { FeatureGrid } from "@/components/layout/FeatureGrid";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichText } from "@/components/internal/RichText";
import { layoutWidth } from "@/lib/layout";
import type { FeatureCard } from "@/lib/structured-pages/types";

export function FeatureGridSection({
  title,
  introHtml,
  cards,
  tone = "white",
}: {
  title?: string | null;
  introHtml?: string | null;
  cards: FeatureCard[];
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone}>
      {title ? <SectionHeading title={title} align="start" className="mb-8" /> : null}
      {introHtml ? (
        <div className={`mb-8 w-full min-w-0 ${layoutWidth.content}`}>
          <RichText html={introHtml} variant="wide" animate={false} />
        </div>
      ) : null}
      <FeatureGrid cards={cards} />
    </SectionShell>
  );
}
