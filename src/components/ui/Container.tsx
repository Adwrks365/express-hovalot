import { type ReactNode } from "react";
import { layoutWidth, pagePadding } from "@/lib/layout";

/** WIDE page shell — nearly full viewport on mobile, centered max-width on desktop */
export function Container({
  children,
  className = "",
  as: Tag = "div",
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
  width?: keyof typeof layoutWidth;
}) {
  return (
    <Tag
      data-layout="container"
      className={`mx-auto w-full min-w-0 ${layoutWidth[width]} ${pagePadding} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
