import * as cheerio from "cheerio";
import fs from "fs";

const html = JSON.parse(fs.readFileSync("src/content/data/homepage-source.json", "utf8")).contentHtml;
const $ = cheerio.load(html);

const results = [];
$(".elementor-widget-image-box").each((_, box) => {
  const title = $(box).find(".elementor-image-box-title").text().trim();
  if (!title.includes("ירושלים") && !title.includes("אחסנה") && !title.includes("אריזה")) return;
  const col = $(box).closest(".elementor-column");
  const badge = col.find(".elementor-widget-image img").first();
  const photo = $(box).find(".elementor-image-box-img img").first();
  results.push({
    title,
    badgeId: (badge.attr("class") || "").match(/wp-image-(\d+)/)?.[1],
    badgeSrc: (badge.attr("src") || "").split("/").pop(),
    photoId: (photo.attr("class") || "").match(/wp-image-(\d+)/)?.[1],
    photoSrc: (photo.attr("src") || "").split("/").pop(),
  });
});

console.log(JSON.stringify(results, null, 2));
