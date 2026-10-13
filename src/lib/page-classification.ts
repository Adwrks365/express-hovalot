export type PageTemplate =
  | "homepage"
  | "article"
  | "service"
  | "location"
  | "contact"
  | "about"
  | "quote"
  | "faq"
  | "blog-index"
  | "utility"
  | "archive"
  | "thank-you"
  | "standard";

const SERVICE_PATHS = new Set([
  "/שירותי-הובלה",
  "/הובלת-דירה-בירושלים",
  "/הובלת-בית-בירושלים",
  "/הובלות-קטנות-בירושלים",
  "/הובלת-פריט-בודד-בירושלים",
  "/הובלות-מיוחדות-בירושלים",
  "/הובלות-דחופות-בירושלים",
  "/הובלת-משטחים-בירושלים",
  "/הובלות-משרדים-בירושלים",
  "/חברת-אריזה-והובלה-בירושלים",
  "/אחסון-תכולה-בירושלים",
  "/אחסון-משטחים",
  "/אחסון-תכולת-דירה",
  "/מחיר-אחסון-תכולה-בירושלים",
  "/אחסון-תכולה-לטווח-קצר",
  "/אחסון-תכולה-לטווח-ארוך",
  "/מחירי-הובלת-דירות",
  "/הובלת-פריטים-בודדים-בירושלים",
  "/הובלות-משטחים-במרכז",
]);

const LOCATION_PREFIX = "/הובלות-ב";

export function classifyPageTemplate(
  path: string,
  type: "page" | "post" | "archive",
): PageTemplate {
  if (path === "/") return "homepage";
  if (type === "post") return "article";
  if (type === "archive") return "archive";

  if (path === "/about-us") return "about";
  if (path === "/צרו-קשר") return "contact";
  if (path === "/הצעת-מחיר") return "quote";
  if (path === "/שאלות-נפוצות") return "faq";
  if (path === "/blog") return "blog-index";
  if (path === "/תודה-רבה") return "thank-you";
  if (
    path === "/privacy-policy" ||
    path === "/terms-of-use" ||
    path === "/accessibility-statement" ||
    path === "/site-map"
  ) {
    return "utility";
  }

  if (SERVICE_PATHS.has(path)) return "service";
  if (path.startsWith(LOCATION_PREFIX) || path.includes("בירושלים") && path.startsWith("/הובל")) {
    if (path.includes("בירושלים") && !SERVICE_PATHS.has(path)) {
      const locationHints = ["במ", "בג", "בא", "מירושלים", "באזור", "בפסגת", "בביתר", "במודיעין", "באבו"];
      if (locationHints.some((h) => path.includes(h))) return "location";
    }
  }

  if (path.startsWith("/הובלות-ב") || path.startsWith("/הובלת-דירה-מ")) return "location";

  return "standard";
}

export function templateLabel(template: PageTemplate): string {
  const labels: Record<PageTemplate, string> = {
    homepage: "Homepage (frozen)",
    article: "ArticlePage",
    service: "ServicePage",
    location: "LocationPage",
    contact: "ContactPage",
    about: "AboutPage",
    quote: "QuotePage",
    faq: "FaqPage",
    "blog-index": "BlogIndexPage",
    utility: "StandardContentPage",
    archive: "ArchivePage",
    "thank-you": "ThankYouPage",
    standard: "StandardContentPage",
  };
  return labels[template];
}
