import { type ElementType, type ReactNode } from "react";
import { typeScale, typeTone, type TypeTone } from "@/lib/typography";

type VisualRole =
  | "hero-display"
  | "hero-seo"
  | "hero-section-line"
  | "page-h1"
  | "section-h2"
  | "subsection-h3"
  | "minor-h4";

const roleClass: Record<VisualRole, string> = {
  "hero-display": typeScale.heroDisplay,
  "hero-seo": typeScale.heroSeo,
  "hero-section-line": typeScale.heroSectionLine,
  "page-h1": typeScale.pageH1,
  "section-h2": typeScale.sectionH2,
  "subsection-h3": typeScale.subsectionH3,
  "minor-h4": typeScale.minorH4,
};

function roleColor(role: VisualRole, tone: TypeTone): string {
  if (role === "hero-seo") return typeTone[tone].accent;
  if (role === "hero-section-line") return typeTone.onDark.heading;
  return typeTone[tone].heading;
}

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

type HeadingProps = {
  as: HeadingLevel;
  role: VisualRole;
  tone?: TypeTone;
  className?: string;
  children: ReactNode;
};

/**
 * Semantic heading with shared visual role.
 * Choose `as` for document outline; choose `role` for appearance.
 */
export function Heading({ as, role, tone = "onLight", className = "", children }: HeadingProps) {
  const Tag = as as ElementType;
  return (
    <Tag className={`${roleClass[role]} ${roleColor(role, tone)} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

/** Pre-configured page title for inner pages (Phase 2B) */
export function PageHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`${typeScale.pageH1} ${typeTone.onLight.heading} ${className}`.trim()}>
      {children}
    </h1>
  );
}

/** Pre-configured major section title (Phase 2B) */
export function SectionTitle({
  children,
  tone = "onLight",
  className = "",
  as = "h2",
}: {
  children: ReactNode;
  tone?: TypeTone;
  className?: string;
  as?: "h2" | "h3";
}) {
  const Tag = as;
  return (
    <Tag className={`${typeScale.sectionH2} ${typeTone[tone].heading} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
