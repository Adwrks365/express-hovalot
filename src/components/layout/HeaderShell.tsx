import type { ReactNode } from "react";
import { headerPadding, headerWidth } from "@/lib/layout";

/** Full-width header shell — wider than page Container */
export function HeaderShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full min-w-0 ${headerWidth} ${headerPadding} ${className}`.trim()}>
      {children}
    </div>
  );
}
