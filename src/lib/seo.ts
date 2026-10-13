import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export type SeoFields = {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  robots?: { index?: string; follow?: string };
  noindex?: boolean;
};

export function buildMetadata(seo: SeoFields, path = "/"): Metadata {
  const canonical = seo.canonical || `${SITE_URL}${path === "/" ? "/" : path}`;
  const title = seo.title || SITE_NAME;
  const description = seo.description || "";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: seo.noindex
      ? { index: false, follow: true }
      : {
          index: seo.robots?.index !== "noindex",
          follow: seo.robots?.follow !== "nofollow",
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "he_IL",
      type: "website",
      ...(seo.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
