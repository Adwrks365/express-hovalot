"use client";

import { usePathname } from "next/navigation";

export function useLeadPageContext(): { pagePath: string; pageTitle: string; pageUrl: string } {
  const pathname = usePathname() || "/";
  const pageTitle = typeof document !== "undefined" ? document.title : "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pageUrl = origin ? `${origin}${pathname}` : pathname;
  return { pagePath: pathname, pageTitle, pageUrl };
}
