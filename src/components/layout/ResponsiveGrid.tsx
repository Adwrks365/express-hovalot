import type { ReactNode } from "react";
import { gridClass } from "@/lib/layout";

export type GridPreset = keyof typeof gridClass;

/** Shared responsive grid — one breakpoint system for inner pages */
export function ResponsiveGrid({
  children,
  preset = "feature",
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  preset?: GridPreset;
  className?: string;
  as?: "div" | "ul";
}) {
  return <Tag className={`${gridClass[preset]} ${className}`.trim()}>{children}</Tag>;
}
