import { type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ContentSection({
  children,
  className = "",
  reveal = true,
  variant = "subtle",
  pad = "normal",
}: {
  children: ReactNode;
  className?: string;
  reveal?: boolean;
  variant?: "subtle" | "card" | "heading";
  pad?: "normal" | "compact" | "tight";
}) {
  const padClass =
    pad === "compact" ? "py-10 lg:py-14" : pad === "tight" ? "py-8 lg:py-10" : "py-12 lg:py-20";

  const inner = (
    <Container className={`${padClass} ${className}`.trim()}>{children}</Container>
  );

  if (!reveal) return inner;
  return (
    <ScrollReveal as="section" variant={variant}>
      {inner}
    </ScrollReveal>
  );
}
