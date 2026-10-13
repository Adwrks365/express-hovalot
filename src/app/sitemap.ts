import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getLaunchSitemapContractItems } from "@/lib/launch-sitemap";
import { toAbsoluteSitemapUrl } from "@/lib/paths";

/** Launch sitemap: indexable 200 URLs only (excludes obsolete 404 test templates). */
export default function sitemap(): MetadataRoute.Sitemap {
  const items = getLaunchSitemapContractItems();

  return items.map((entry) => {
    const path = entry.requiredNewPath;
    return {
      url: toAbsoluteSitemapUrl(SITE_URL, path),
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : entry.contentType === "post" ? 0.6 : 0.7,
    };
  });
}
