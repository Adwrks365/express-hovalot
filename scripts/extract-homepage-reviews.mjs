import fs from "node:fs";
import * as cheerio from "cheerio";

const data = JSON.parse(fs.readFileSync("src/content/data/homepage-source.json", "utf8"));
const $ = cheerio.load(data.contentHtml || "");

const reviews = [];
$(".ti-review-item, .grw-review, [class*='review-item']").each((_, el) => {
  const name = $(el).find(".ti-name, .grw-review-name, [class*='name']").first().text().trim();
  const text = $(el).find(".ti-review-text, .grw-review-text, [class*='review-text']").first().text().trim();
  if (name || text) reviews.push({ name, text });
});

// Trustindex fallback parsing
if (reviews.length === 0) {
  const blocks = data.contentHtml.split(/Trustindex|ti-widget|google-reviews/i);
  const nameRegex = /([A-Za-z\u0590-\u05FF\s]{2,40})\s+Trustindex/g;
  let m;
  const names = new Set();
  while ((m = nameRegex.exec(data.contentHtml)) !== null) {
    const name = m[1].trim();
    if (name.length > 2 && !name.includes("Google")) names.add(name);
  }
  // Parse review texts after names in widget area
  $(".elementor-widget-container").each((_, el) => {
    const t = $(el).text();
    if (t.includes("Google ביקורות") || t.includes("Trustindex")) {
      const chunks = t.split(/פורסם ב-Google\s*/).slice(1);
      for (const chunk of chunks) {
        const parts = chunk.split(/\s{2,}/);
        const name = parts[0]?.trim();
        const text = parts.slice(1).join(" ").replace(/Trustindex.*/s, "").trim();
        if (name && text && text.length > 10) {
          reviews.push({ name, text: text.slice(0, 500) });
        }
      }
    }
  });
}

// Dedupe
const seen = new Set();
const deduped = reviews.filter((r) => {
  const key = r.name + r.text.slice(0, 40);
  if (seen.has(key)) return false;
  seen.add(key);
  return r.text.length > 5;
});

const ratingBlock = $(".elementor-widget-container")
  .filter((_, el) => $(el).text().includes("Google ביקורות"))
  .first()
  .text();

const ratingMatch = ratingBlock.match(/(\d+(?:\.\d+)?)\s*Google\s*ביקורות/);
const countMatch = ratingBlock.match(/(\d+)\s*Google\s*ביקורות/);

const businessName = "הובלות אקספרס - שינוע מטענים בע\"מ";

const output = {
  extractedAt: new Date().toISOString(),
  businessName,
  rating: ratingMatch ? Number(ratingMatch[1]) : null,
  reviewCount: countMatch ? Number(countMatch[1]) : deduped.length,
  reviews: deduped.slice(0, 12),
};

fs.writeFileSync("src/content/homepage-reviews.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify({ count: output.reviews.length, rating: output.rating, reviewCount: output.reviewCount }, null, 2));
