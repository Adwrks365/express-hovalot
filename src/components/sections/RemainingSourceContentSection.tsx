import { RichTextSection } from "@/components/sections/RichTextSection";
import type { SectionTone } from "@/components/layout/ResponsiveSection";

/** Safe fallback for source content not captured by semantic blocks (Phase 2B.4D). */
export function RemainingSourceContentSection({
  html,
  tone = "white",
  animate = false,
}: {
  html: string;
  tone?: SectionTone;
  animate?: boolean;
}) {
  if (!html?.trim()) return null;
  return (
    <div data-section-type="remaining">
      <RichTextSection html={html} tone={tone} animate={animate} />
    </div>
  );
}
