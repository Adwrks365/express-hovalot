import { type ReactNode } from "react";
import { layoutWidth } from "@/lib/layout";

/** Centered content column — FAQ, calculator, structured sections */
export function ContentWidth({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag className={`mx-auto w-full ${layoutWidth.content} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
