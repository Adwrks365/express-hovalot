import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { isPreviewNoIndex } from "@/lib/env";

export const revalidate = 3600;

function isPreviewDeployment(): boolean {
  if (process.env.VERCEL_ENV === "preview") return true;
  return isPreviewNoIndex(null);
}

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
