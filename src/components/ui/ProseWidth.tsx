import { type ReactNode } from "react";
import { layoutWidth } from "@/lib/layout";

export type ProseVariant = "normal" | "wide" | "content";

const variantClass: Record<ProseVariant, string> = {
  normal: layoutWidth.prose,
  wide: layoutWidth.proseWide,
  content: layoutWidth.content,
};

/** Readable Hebrew prose column — one max-width only */
export function ProseWidth({
  children,
  className = "",
  as: Tag = "div",
  variant = "normal",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  variant?: ProseVariant;
}) {
  return (
    <Tag className={`mx-auto w-full ${variantClass[variant]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
