const SITE_HOST = "express-hovalot.co.il";

/** Decode pathname safely (handles already-decoded Hebrew). */
export function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Normalize to contract form: decoded, leading slash, no trailing slash (except root). */
export function normalizePathname(path: string): string {
  if (!path || path === "/") return "/";

  let p = path.trim();
  if (!p.startsWith("/")) p = `/${p}`;

  const segments = p.split("/").filter(Boolean).map(decodePathSegment);
  return segments.length ? `/${segments.join("/")}` : "/";
}

/** Canonical pathname with trailing slash (WordPress convention). */
export function canonicalPathname(path: string): string {
  const normalized = normalizePathname(path);
  return normalized === "/" ? "/" : `${normalized}/`;
}

/** RFC-3986 path with percent-encoded segments and trailing slash (for sitemap loc). */
export function encodedPathnameWithTrailingSlash(path: string): string {
  const normalized = normalizePathname(path);
  if (normalized === "/") return "/";
  const encoded =
    normalized
      .split("/")
      .map((seg, i) => (i === 0 ? "" : encodeURIComponent(decodePathSegment(seg))))
      .join("/") || "/";
  return `${encoded}/`;
}

/** Absolute production URL for sitemap entries (encoded path). */
export function toAbsoluteSitemapUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const encodedPath = encodedPathnameWithTrailingSlash(path);
  return encodedPath === "/" ? `${base}/` : `${base}${encodedPath}`;
}

export function slugArrayToPath(slug?: string[]): string {
  if (!slug?.length) return "/";
  return normalizePathname(`/${slug.map(decodePathSegment).join("/")}`);
}

export function pathToSlugArray(path: string): string[] {
  const normalized = normalizePathname(path);
  if (normalized === "/") return [];
  return normalized.slice(1).split("/");
}

export function isInternalProductionUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === SITE_HOST || u.hostname === `www.${SITE_HOST}`;
  } catch {
    return url.startsWith("/");
  }
}

/** Legacy WordPress slugs → preserved canonical paths */
const LEGACY_PATH_ALIASES: Record<string, string> = {
  "/contact-us": "/צרו-קשר",
  "/פתרונות-אחסנה": "/אחסון-תכולה-בירושלים",
};

export function resolveLegacyPath(path: string): string {
  const normalized = normalizePathname(path);
  return LEGACY_PATH_ALIASES[normalized] ?? normalized;
}

export function productionUrlToPath(url: string): string | null {
  try {
    const u = new URL(url);
    if (!isInternalProductionUrl(url)) return null;
    return resolveLegacyPath(u.pathname);
  } catch {
    return null;
  }
}

export function pathKeys(path: string): string[] {
  const normalized = normalizePathname(path);
  const encoded = normalized
    .split("/")
    .map((seg, i) => (i === 0 ? "" : encodeURIComponent(decodePathSegment(seg))))
    .join("/") || "/";
  const keys = new Set<string>([normalized, encoded]);
  if (normalized !== "/") {
    keys.add(`${normalized}/`);
    keys.add(`${encoded}/`);
  }
  return [...keys];
}
