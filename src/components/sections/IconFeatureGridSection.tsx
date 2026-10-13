import { MediaWrapper } from "@/components/layout/MediaWrapper";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function IconFeatureGridSection({
  title,
  items,
  tone = "muted",
}: {
  title?: string | null;
  items: { icon?: string | null; title: string; description: string }[];
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone}>
      {title ? <SectionHeading title={title} align="start" className="mb-8" /> : null}
      <ResponsiveGrid preset="iconFeature">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-3 text-center shadow-sm sm:p-5 sm:text-start"
          >
            {item.icon ? <MediaWrapper src={item.icon} role="icon" alt="" /> : null}
            <h3 className="text-sm font-bold text-brand-900 sm:text-base lg:text-lg">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 sm:mt-2 sm:text-sm lg:text-base">
              {item.description}
            </p>
          </div>
        ))}
      </ResponsiveGrid>
    </SectionShell>
  );
}
