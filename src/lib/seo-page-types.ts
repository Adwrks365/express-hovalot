import { mainNavigation } from "@/config/navigation";
import { normalizePathname } from "@/lib/paths";

export type SeoPageKind = "home" | "service" | "area" | "storage" | "hub" | "blog" | "legal" | "other";

const servicePaths = new Set<string>();
const storagePaths = new Set<string>();
const areaPaths = new Set<string>();
const hubPaths = new Set<string>();

for (const item of mainNavigation) {
  const href = normalizePathname(item.href);
  if (item.label.includes("שירותי הובלה")) hubPaths.add(href);
  if (item.label.includes("אחסון")) hubPaths.add(href);
  if (item.label.includes("אזור")) hubPaths.add(href);
  if (item.label.includes("טיפים")) hubPaths.add(normalizePathname("/blog"));
  for (const child of item.children ?? []) {
    const p = normalizePathname(child.href.split("#")[0]);
    if (item.label.includes("שירותי הובלה")) servicePaths.add(p);
    else if (item.label.includes("אחסון")) storagePaths.add(p);
    else if (item.label.includes("אזור")) areaPaths.add(p);
  }
}

export function classifySeoPage(path: string): SeoPageKind {
  const p = normalizePathname(path);
  if (p === "/") return "home";
  if (p === "/blog/" || p.startsWith("/category/") || p.startsWith("/tag/") || p.startsWith("/author/")) return "blog";
  if (servicePaths.has(p)) return "service";
  if (storagePaths.has(p)) return "storage";
  if (areaPaths.has(p)) return "area";
  if (hubPaths.has(p)) return "hub";
  if (["/privacy-policy/", "/terms-of-use/", "/accessibility-statement/"].includes(p)) return "legal";
  return "other";
}
