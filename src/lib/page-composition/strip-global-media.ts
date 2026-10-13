import * as cheerio from "cheerio";
import {
  isGlobalClientLogoMedia,
  isGlobalTestimonialMedia,
  isPortraitThumbnail,
} from "@/content/migration/global-media-filter";

/** Remove global testimonial + client-logo widget HTML before page composition. */
export function stripGlobalMediaSections(html: string): string {
  if (!html?.trim()) return html;

  const $ = cheerio.load(`<div id="sgm">${html}</div>`, {}, false);
  const root = $("#sgm");

  root.find("img").each((_, el) => {
    const src = $(el).attr("src") || "";
    const w = $(el).attr("width");
    const h = $(el).attr("height");
    if (
      isGlobalTestimonialMedia(src) ||
      isGlobalClientLogoMedia(src) ||
      isPortraitThumbnail(w, h)
    ) {
      const widget = $(el).closest(
        ".elementor-widget-image, .elementor-widget-image-box, .elementor-widget-rating, .elementor-column, .elementor-widget-wrap",
      );
      if (widget.length && widget.find("img").length <= 3) {
        widget.remove();
      } else {
        $(el).remove();
      }
    }
  });

  // Remove logo-only clusters (4+ small brand logos, minimal text)
  root.find("p, div").each((_, el) => {
    const $el = $(el);
    const imgs = $el.find("> img, img");
    if (imgs.length >= 4 && $el.text().replace(/\s+/g, "").length < 30) {
      let logoCount = 0;
      imgs.each((__, img) => {
        if (isGlobalClientLogoMedia($(img).attr("src"))) logoCount++;
      });
      if (logoCount >= 4) $el.remove();
    }
  });

  return root.html()?.trim() || "";
}
