import * as cheerio from "cheerio";
import fs from "fs";

const h = JSON.parse(
  fs.readFileSync("src/content/data/homepage-source.json", "utf8"),
).contentHtml;
const $ = cheerio.load(h);

const cards = [];
$("h3.elementor-heading-title").each((_, el) => {
  const title = $(el).text().trim();
  if (
    !title.includes("ירושלים") &&
    !title.includes("אחסנה") &&
    !title.includes("אריזה") &&
    !title.includes("משטח") &&
    !title.includes("מנוף") &&
    !title.includes("משרד")
  ) {
    return;
  }
  const col = $(el).closest(".elementor-column");
  const imgs = col
    .find("img")
    .map((__, img) => {
      const cls = $(img).attr("class") || "";
      const id = cls.match(/wp-image-(\d+)/)?.[1];
      return { id, src: $(img).attr("src"), width: $(img).attr("width") };
    })
    .get();
  cards.push({ title, imgs });
});

console.log(JSON.stringify(cards, null, 2));
