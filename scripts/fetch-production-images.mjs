import * as cheerio from "cheerio";

const path = process.argv[2] || "/הובלות-בגבעת-זאב/";
const url = `https://express-hovalot.co.il${path.startsWith("/") ? path : `/${path}`}`;
const res = await fetch(url);
const html = await res.text();
const $ = cheerio.load(html);
const imgs = new Set();
$("img[src]").each((_, el) => {
  const src = $(el).attr("src") || "";
  if (src.includes("uploads")) imgs.add(src.split("?")[0]);
});
console.log("URL:", url);
console.log("Production images:", imgs.size);
for (const u of imgs) console.log(" ", u.split("/").pop());
