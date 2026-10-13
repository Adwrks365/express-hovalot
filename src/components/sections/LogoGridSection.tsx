import { LogoCollection } from "@/components/layout/LogoCollection";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LogoGridSection({
  title,
  logos,
  tone = "white",
  useMarquee = false,
}: {
  title?: string | null;
  logos?: { src: string; alt: string }[];
  tone?: SectionTone;
  useMarquee?: boolean;
}) {
  if (!useMarquee && !logos?.length) return null;

  return (
    <SectionShell tone={tone} pad="compact">
      {title ? <SectionHeading title={title} className="mb-6 sm:mb-8" /> : null}
      <LogoCollection logos={logos} useMarquee={useMarquee} />
    </SectionShell>
  );
}
