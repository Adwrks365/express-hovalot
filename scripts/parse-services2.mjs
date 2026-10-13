import * as cheerio from "cheerio";
import fs from "fs";

const html = JSON.parse(
  fs.readFileSync("src/content/data/homepage-source.json", "utf8"),
).contentHtml;
const $ = cheerio.load(html);

// Services section starts after "השירותים המקצועיים"
const start = html.indexOf("השירותים המקצועיים");
const chunk = html.slice(start, start + 120000);
const $c = cheerio.load(chunk);

const cards = [];
$c(".elementor-column").each((_, col) => {
  const title = $c(col).find("h3.elementor-heading-title").first().text().trim();
  if (!title) return;
  const imgs = $c(col)
    .find("img")
    .map((__, img) => {
      const cls = $c(img).attr("class") || "";
      return {
        id: cls.match(/wp-image-(\d+)/)?.[1],
        w: $c(img).attr("width"),
        src: ($c(img).attr("src") || "").split("/").pop(),
      };
    })
    .get();
  if (imgs.length) cards.push({ title, imgs });
});

console.log(JSON.stringify(cards, null, 2));
