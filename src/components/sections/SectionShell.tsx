import type { ReactNode } from "react";
import {
  ResponsiveSection,
  type SectionPadVariant,
  type SectionTone,
} from "@/components/layout/ResponsiveSection";

export function SectionShell({
  children,
  tone = "white",
  className = "",
  id,
  pad = "normal",
}: {
  children: ReactNode;
  tone?: SectionTone;
  className?: string;
  id?: string;
  pad?: SectionPadVariant;
}) {
  return (
    <ResponsiveSection id={id} tone={tone} pad={pad} className={className}>
      {children}
    </ResponsiveSection>
  );
}
