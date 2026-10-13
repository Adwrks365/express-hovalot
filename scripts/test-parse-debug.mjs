import pages from "../src/content/data/pages.json" with { type: "json" };
import { sanitizeWordPressHtml, htmlToPlainText } from "../src/lib/wp-html.ts";
import { parsePageComposition } from "../src/lib/page-composition/parse-page-composition.ts";
import * as cheerio from "cheerio";

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["הובלות-בגבעת-זאב", "הובלות-משרדים-בירושלים", "חברת-אריזה-והובלה-בירושלים", "הצעת-מחיר"];

for (const slug of slugs) {
  const p = pages.find((x) => x.slug === slug);
  if (!p) continue;
  const sanitized = sanitizeWordPressHtml(p.contentHtml, { stripDuplicateH1: true });
  const archetype = slug.includes("הובלות-ב") && slug !== "הובלות-בירושלים" ? "AREA_PAGE" : slug.includes("אחסון") ? "STORAGE_SERVICE" : slug.includes("הצעת") ? "PRICING_PAGE" : "MOVING_SERVICE";
  const comp = parsePageComposition(sanitized, archetype);
  const $ = cheerio.load(`<div id="root">${sanitized}</div>`, {}, false);
  const sourceText = htmlToPlainText(sanitized).length;
  const parsedText = htmlToPlainText([comp.introHtml, ...comp.blocks.map((b) => {
    if (b.type === "prose") return b.html;
    if (b.type === "faq") return b.introHtml || "";
    if (b.type === "featureGrid") return (b.introHtml || "") + b.cards.map(c => c.descriptionHtml).join("");
    return "";
  }).filter(Boolean)].join("")).length;
  console.log("\n===", slug, "===");
  console.log("source text:", sourceText, "parsed text:", parsedText, "coverage:", (parsedText/sourceText*100).toFixed(1)+"%");
  console.log("h2:", $("#root h2").length, "p:", $("#root p").length, "img:", $("#root img").length);
  console.log("blocks:", comp.blocks.length, comp.blocks.map((b) => b.type).join(","));
  console.log("remaining:", comp.remainingContentBlocks?.length || 0, "coverageRatio:", comp.coverageRatio);
}
