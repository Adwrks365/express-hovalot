import * as cheerio from "cheerio";
import {
  isAllowedPageMedia,
  isGlobalClientLogoMedia,
  isGlobalTestimonialMedia,
  mediaKeyFromSrc,
} from "@/content/migration/global-media-filter";
import { wpUrlToLocal } from "@/lib/media";
import { stripGlobalMediaSections } from "@/lib/page-composition/strip-global-media";
import { sanitizeWordPressHtml } from "@/lib/wp-html";

export type PageMediaEntry = {
  mediaKey: string;
  mediaUrl: string;
  localPath: string | null;
  role: "content" | "featured" | "global-testimonial" | "global-logo" | "portrait" | "header-footer";
  productionRendered: boolean;
  sharedGlobal: boolean;
  allowedOnPage: boolean;
};

export type PageMediaRecord = {
  url: string;
  wpPageId: number | null;
  entries: PageMediaEntry[];
};

function classifyMedia(src: string, productionKeys: Set<string>): Omit<PageMediaEntry, "mediaKey" | "mediaUrl" | "localPath"> {
  const key = mediaKeyFromSrc(src);
  const globalTestimonial = isGlobalTestimonialMedia(src);
  const globalLogo = isGlobalClientLogoMedia(src);
  const sharedGlobal = globalTestimonial || globalLogo;
  const productionRendered = productionKeys.has(key) || productionKeys.has(src.split("/").pop()?.toLowerCase() || "");
  const allowedOnPage = !sharedGlobal && isAllowedPageMedia(src);

  let role: PageMediaEntry["role"] = "content";
  if (globalTestimonial) role = "global-testimonial";
  else if (globalLogo) role = "global-logo";

  return {
    role,
    productionRendered,
    sharedGlobal,
    allowedOnPage,
  };
}

/** Build allowed media inventory from sanitized page HTML (post global strip). */
export function buildPageMediaOwnership(
  path: string,
  wpPageId: number | null,
  contentHtml: string,
  featuredImage?: string | null,
  productionImageKeys: Set<string> = new Set(),
): PageMediaRecord {
  const sanitized = stripGlobalMediaForInventory(contentHtml);
  const $ = cheerio.load(`<div>${sanitized}</div>`, {}, false);
  const seen = new Set<string>();
  const entries: PageMediaEntry[] = [];

  $("img[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    const local = wpUrlToLocal(src.split("?")[0]) || src;
    const key = mediaKeyFromSrc(src);
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      mediaKey: key,
      mediaUrl: src.split("?")[0],
      localPath: local.startsWith("/") ? local : null,
      ...classifyMedia(src, productionImageKeys),
    });
  });

  if (featuredImage) {
    const key = mediaKeyFromSrc(featuredImage);
    if (!seen.has(key)) {
      entries.push({
        mediaKey: key,
        mediaUrl: featuredImage,
        localPath: featuredImage.startsWith("/") ? featuredImage : wpUrlToLocal(featuredImage),
        role: "featured",
        productionRendered: productionImageKeys.has(key),
        sharedGlobal: false,
        allowedOnPage: true,
      });
    }
  }

  return { url: path, wpPageId, entries };
}

function stripGlobalMediaForInventory(html: string): string {
  return stripGlobalMediaSections(sanitizeWordPressHtml(html, { stripDuplicateH1: true }));
}

/** Normalize rendered img src to comparable key */
export function renderedMediaKey(src: string): string {
  return mediaKeyFromSrc(src.split("?")[0]);
}
