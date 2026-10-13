import * as cheerio from "cheerio";
import { readFileSync } from "node:fs";

const pages = JSON.parse(readFileSync("src/content/data/pages.json", "utf8"));
for (const path of ["/הובלות-קטנות-בירושלים", "/הובלות-בגבעת-זאב", "/הובלות-משרדים-בירושלים"]) {
  const p = pages.find((x) => x.path === path);
  const $ = cheerio.load(p.contentHtml);
  console.log("\n===", path, "===");
  console.log("h2:", $("h2").length, "h3:", $("h3").length, "img:", $("img").length);
  $("h2").slice(0, 5).each((i, el) => console.log(" h2", i, $(el).text().trim().slice(0, 50)));
}
