/** Percent-encoded destinations — avoids mojibake in Next/Vercel redirect Location headers. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/contact-us": "/%D7%A6%D7%A8%D7%95-%D7%A7%D7%A9%D7%A8/",
  "/contact-us/": "/%D7%A6%D7%A8%D7%95-%D7%A7%D7%A9%D7%A8/",
  "/פתרונות-אחסנה": "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
  "/פתרונות-אחסנה/": "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
  "/%D7%A4%D7%AA%D7%A8%D7%95%D7%A0%D7%95%D7%AA-%D7%90%D7%97%D7%A1%D7%A0%D7%94": "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
  "/%D7%A4%D7%AA%D7%A8%D7%95%D7%A0%D7%95%D7%AA-%D7%90%D7%97%D7%A1%D7%A0%D7%94/": "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
};
