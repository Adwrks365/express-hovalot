import { RichText } from "@/components/internal/RichText";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";

export function RichTextSection({
  html,
  tone = "white",
  animate = false,
}: {
  html: string;
  tone?: SectionTone;
  animate?: boolean;
}) {
  return (
    <SectionShell tone={tone}>
      <RichText html={html} variant="wide" animate={animate} />
    </SectionShell>
  );
}
