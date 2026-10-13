import posts from "../src/content/data/posts.json" with { type: "json" };
import * as cheerio from "cheerio";
import { readFileSync } from "node:fs";

// Inline minimal sanitize check via dynamic import won't work easily; parse manually
const paths = [
  "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
  "/הזמן-הכי-טוב-לבצע-הובלה-בירושלים",
  "/הובלות-קטנות-בירושלים-המדריך-המלא",
];

function plain(html) {
  const $ = cheerio.load(html, {}, false);
  return $.root().text().replace(/\s+/g, " ").trim();
}

for (const path of paths) {
  const p = posts.find((x) => x.path === path);
  if (!p) {
    console.log("NOT FOUND", path);
    continue;
  }
  const raw = p.contentHtml;
  console.log("\n===", p.title, "===");
  console.log("path:", path);
  console.log("raw html:", raw.length, "chars");
  console.log("raw text:", plain(raw).length, "chars");
  console.log("h1:", (raw.match(/<h1/gi) || []).length);
  console.log("h2:", (raw.match(/<h2/gi) || []).length);
  console.log("h3:", (raw.match(/<h3/gi) || []).length);
  console.log("img:", (raw.match(/<img/gi) || []).length);
  console.log("p:", (raw.match(/<p/gi) || []).length);
}
