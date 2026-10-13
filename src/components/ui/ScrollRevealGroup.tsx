"use client";

import { Children, type ReactNode } from "react";
import { ScrollReveal, type RevealVariant } from "@/components/ui/ScrollReveal";

type Props = {
  children: ReactNode;
  variant?: RevealVariant;
  staggerMs?: number;
  className?: string;
  as?: "ul" | "div";
};

/** Staggered reveal for grids (e.g. client logos) */
export function ScrollRevealGroup({
  children,
  variant = "logo",
  staggerMs = 55,
  className = "",
  as: Tag = "div",
}: Props) {
  return (
    <Tag className={className}>
      {Children.map(children, (child, index) => (
        <ScrollReveal key={index} variant={variant} delayMs={index * staggerMs} as="li">
          {child}
        </ScrollReveal>
      ))}
    </Tag>
  );
}
