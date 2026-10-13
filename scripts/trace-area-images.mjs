import pages from "../src/content/data/pages.json" with { type: "json" };
import { sanitizeWordPressHtml } from "../src/lib/wp-html.ts";
import { parsePageComposition } from "../src/lib/page-composition/parse-page-composition.ts";
import * as cheerio from "cheerio";

const slug = process.argv[2] || "הובלות-בגבעת-זאב";
const p = pages.find((x) => x.slug === slug);
if (!p) {
  console.error("not found");
  process.exit(1);
}
const s = sanitizeWordPressHtml(p.contentHtml, { stripDuplicateH1: true });
const $ = cheerio.load(`<div>${s}</div>`);
console.log("=== SOURCE IMAGES ===", slug);
$("img").each((i, el) => {
  const src = $(el).attr("src") || "";
  const alt = $(el).attr("alt") || "";
  console.log(i, src.split("/").pop(), "|", alt.slice(0, 60));
});

const comp = parsePageComposition(s, "AREA_PAGE");
console.log("\n=== PARSED BLOCKS WITH MEDIA ===");
for (const b of comp.blocks) {
  if (b.type === "featureGrid") {
    console.log("featureGrid", b.cards.map((c) => ({ title: c.title?.slice(0, 40), img: c.image?.split("/").pop() })));
  }
  if (b.type === "imageText") console.log("imageText", b.image?.split("/").pop());
  if (b.type === "logoGrid") console.log("logoGrid", b.logos.map((l) => l.src.split("/").pop()));
  if (b.type === "prose") {
    const imgs = (b.html.match(/src="([^"]+)"/g) || []).map((x) => x.split("/").pop()?.replace('"', ""));
    if (imgs.length) console.log("prose imgs", imgs);
  }
}
