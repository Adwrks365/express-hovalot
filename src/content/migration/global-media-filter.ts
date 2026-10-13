/**
 * Global / sitewide media fingerprints — NOT page-specific content.
 * Phase 2B.4E: exclude from semantic composition on SERVICE/AREA pages.
 */

/** Team testimonial portraits reused across many inner pages (Elementor global widget) */
export const GLOBAL_TESTIMONIAL_MEDIA_KEYS = new Set([
  "2790-rina",
  "rina.webp",
  "2789-shyli",
  "shyli.webp",
  "2788-eran",
  "eran.webp",
]);

/** Client logo strip reused sitewide (homepage/footer global template) */
export const GLOBAL_CLIENT_LOGO_KEYS = new Set([
  "2354-adidas",
  "2355-aldo",
  "2356-bitahon",
  "2357-castro",
  "2358-elbit",
  "2359-fc",
  "2360-jerusa",
  "2361-lod",
  "2363-modii",
  "2364-orian",
  "2365-tobol",
  "adidas.webp",
  "aldo.webp",
  "bitahon.webp",
  "castro.webp",
  "elbit.webp",
]);

export function mediaKeyFromSrc(src: string | null | undefined): string {
  if (!src) return "";
  try {
    const decoded = decodeURIComponent(src);
    return decoded.split("/").pop()?.toLowerCase().replace(/\.[a-z0-9]+$/i, "") || decoded.toLowerCase();
  } catch {
    return src.split("/").pop()?.toLowerCase() || src.toLowerCase();
  }
}

export function isGlobalTestimonialMedia(src: string | null | undefined): boolean {
  const key = mediaKeyFromSrc(src);
  const file = (src || "").split("/").pop()?.toLowerCase() || "";
  return (
    GLOBAL_TESTIMONIAL_MEDIA_KEYS.has(key) ||
    GLOBAL_TESTIMONIAL_MEDIA_KEYS.has(file) ||
    /rina|shyli|eran/.test(file)
  );
}

export function isGlobalClientLogoMedia(src: string | null | undefined): boolean {
  const key = mediaKeyFromSrc(src);
  const file = (src || "").split("/").pop()?.toLowerCase() || "";
  return GLOBAL_CLIENT_LOGO_KEYS.has(key) || GLOBAL_CLIENT_LOGO_KEYS.has(file);
}

/** Square portrait thumbnails (testimonial widgets) — not service imagery */
export function isPortraitThumbnail(width?: string | number | null, height?: string | number | null): boolean {
  const w = Number(width || 0);
  const h = Number(height || 0);
  if (w > 0 && h > 0 && w === h && w <= 320) return true;
  return false;
}

export function isAllowedPageMedia(
  src: string | null | undefined,
  width?: string | number | null,
  height?: string | number | null,
): boolean {
  if (!src) return false;
  if (isGlobalTestimonialMedia(src)) return false;
  if (isGlobalClientLogoMedia(src)) return false;
  if (isPortraitThumbnail(width, height)) return false;
  return true;
}
