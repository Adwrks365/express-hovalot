import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { sectionPad } from "@/lib/layout";

export type SectionTone = "white" | "muted" | "brand" | "neutral";

const toneClass: Record<SectionTone, string> = {
  white: "bg-white",
  muted: "bg-brand-50/45",
  brand: "bg-brand-900 text-white",
  neutral: "bg-neutral-50",
};

export type SectionPadVariant = keyof typeof sectionPad;

/** Shared section wrapper — consistent padding, tone, and container width */
export function ResponsiveSection({
  children,
  tone = "white",
  pad = "normal",
  className = "",
  id,
  containerClassName = "",
}: {
  children: ReactNode;
  tone?: SectionTone;
  pad?: SectionPadVariant;
  className?: string;
  id?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={`${toneClass[tone]} ${sectionPad[pad]} ${className}`.trim()}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
