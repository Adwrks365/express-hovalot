import Link from "next/link";
import { type ReactNode } from "react";
import { InlineHtml } from "@/components/redesign/RichContent";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { SourceHeading } from "@/lib/redesign/blocks";
import { layoutWidth } from "@/lib/layout";

export type SectionTone = "white" | "mist" | "dark";

const toneClass: Record<SectionTone, string> = {
  white: "bg-white",
  mist: "bg-gradient-to-b from-brand-50 via-brand-50/70 to-brand-50/30",
  dark: "bg-[linear-gradient(160deg,#003405_0%,#13330E_55%,#0a1f0a_100%)] text-white",
};

export function RedesignSection({
  tone,
  children,
  width = "standard",
  pad = "normal",
  className = "",
  id,
  kind,
}: {
  tone: SectionTone;
  children: ReactNode;
  width?: keyof typeof layoutWidth;
  pad?: "normal" | "compact" | "tight";
  className?: string;
  id?: string;
  kind: string;
}) {
  const padClass =
    pad === "normal" ? "py-12 sm:py-16 lg:py-20" : pad === "compact" ? "py-10 sm:py-12 lg:py-14" : "py-7 sm:py-9 lg:py-10";
  return (
    <section id={id} className={`relative overflow-hidden ${toneClass[tone]} ${padClass} ${className}`.trim()} data-section-type={kind} data-tone={tone}>
      <Container width={width}>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  heading,
  tone = "white",
  align = "start",
  className = "",
  children,
}: {
  eyebrow?: SourceHeading;
  heading?: SourceHeading;
  tone?: SectionTone;
  align?: "start" | "center";
  className?: string;
  children?: ReactNode;
}) {
  if (!eyebrow && !heading && !children) return null;
  const dark = tone === "dark";
  const Tag = heading?.as ? (`h${heading.as}` as "h2" | "h3" | "h4") : heading && heading.level >= 3 ? "h3" : "h2";
  const center = align === "center";
  return (
    <ScrollReveal variant="heading" className={`${center ? "mx-auto text-center" : "text-start"} max-w-[52rem] ${className}`.trim()}>
      {eyebrow ? (
        <p
          className={`mb-3 flex items-center gap-2.5 text-sm font-bold sm:text-[0.95rem] ${center ? "justify-center" : ""} ${dark ? "text-accent-300" : "text-brand-600"}`}
        >
          <span className={`h-0.5 w-7 shrink-0 rounded-full ${dark ? "bg-accent-300" : "bg-accent"}`} aria-hidden="true" />
          <span>{eyebrow.text}</span>
        </p>
      ) : null}
      {heading ? (
        <Tag
          className={`text-balance font-bold leading-snug ${heading.text.length > 110 ? "text-lg sm:text-xl" : "text-[1.6rem] sm:text-3xl lg:text-[2.1rem]"} ${dark ? "text-white" : "text-brand-800"}`}
        >
          {heading.href ? (
            <Link href={heading.href} className="underline-offset-4 transition-colors hover:text-brand-500 hover:underline">
              {heading.text}
            </Link>
          ) : heading.html ? (
            <InlineHtml
              value={heading.html}
              className="[&_a]:underline [&_a]:decoration-accent/60 [&_a]:underline-offset-4 [&_a:hover]:text-brand-500"
            />
          ) : (
            heading.text
          )}
        </Tag>
      ) : null}
      {heading && !eyebrow ? (
        <span className={`mt-4 block h-1 w-12 rounded-full bg-accent ${center ? "mx-auto" : ""}`} aria-hidden="true" />
      ) : null}
      {children}
    </ScrollReveal>
  );
}
