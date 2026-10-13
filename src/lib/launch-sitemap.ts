import urlContract from "@/content/data/url-contract.json";

type ContractItem = {
  requiredNewPath: string;
  expectedStatus?: number;
  expectedIndexability?: string;
  contentType?: string;
};

/** Obsolete WordPress test pages — local 404, must not appear in launch sitemap. */
export const OBSOLETE_LAUNCH_PATHS = new Set(["/שגיאה-404-1/", "/שגיאה-404-2/"]);

export function normalizeLaunchPath(path: string): string {
  let p = path;
  try {
    p = decodeURIComponent(path);
  } catch {
    /* keep */
  }
  if (!p.startsWith("/")) p = `/${p}`;
  if (p !== "/" && !p.endsWith("/")) p = `${p}/`;
  return p;
}

export function isObsoleteLaunchPath(path: string): boolean {
  return OBSOLETE_LAUNCH_PATHS.has(normalizeLaunchPath(path));
}

export function isLaunchSitemapContractItem(item: ContractItem): boolean {
  if (item.expectedStatus !== 200) return false;
  if (item.expectedIndexability && item.expectedIndexability !== "indexable") return false;
  return !isObsoleteLaunchPath(item.requiredNewPath);
}

export function getLaunchSitemapContractItems(): ContractItem[] {
  const items = (urlContract as { items?: ContractItem[] }).items || [];
  return items.filter(isLaunchSitemapContractItem);
}

/** Keep link in HTML sitemap when true. */
export function filterLaunchSitemapHref(href: string): boolean {
  if (!href || href.startsWith("#")) return false;
  let pathname = href;
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      if (u.hostname.replace(/^www\./, "") !== "express-hovalot.co.il") return false;
      pathname = u.pathname;
    } catch {
      return false;
    }
  }
  return !isObsoleteLaunchPath(pathname);
}
