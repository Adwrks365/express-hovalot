/**
 * Test composition parser via built Next output — run after build
 * Uses dynamic import from compiled path OR duplicates minimal logic
 */
import * as cheerio from "cheerio";
import { readFileSync } from "node:fs";

// Mirror key parser behavior for diagnosis
function stripText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFeatureCards(html) {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const cards = [];
  $("h3, h4").each((_, heading) => {
    const title = $(heading).text().replace(/\s+/g, " ").trim();
    if (!title || title.length > 120) return;
    let img = null;
    const prevImg = $(heading).prevAll("img").first();
    const nextImg = $(heading).nextAll("img").first();
    const imgEl = prevImg.length ? prevImg : nextImg;
    if (imgEl.length) img = imgEl.attr("src");
    const parts = [];
    let sib = $(heading).next();
    while (sib.length && !sib.is("h2, h3, h4")) {
      if (!sib.is("img")) parts.push($.html(sib) || "");
      sib = sib.next();
    }
    const descriptionHtml = parts.join("").trim();
    if (descriptionHtml.length > 20) cards.push({ title, img, len: descriptionHtml.length });
  });
  return cards;
}

const pages = JSON.parse(readFileSync("src/content/data/pages.json", "utf8"));
const path = "/הובלות-בגבעת-זאב";
const p = pages.find((x) => x.path === path);
const $ = cheerio.load(p.contentHtml);
let current = null;
const sections = [];
$("h2").each((_, el) => {
  const heading = $(el).text().trim();
  const html = [];
  let sib = $(el).next();
  while (sib.length && !sib.is("h2")) {
    html.push($.html(sib));
    sib = sib.next();
  }
  sections.push({ heading: heading.slice(0, 40), html: html.join(""), cards: extractFeatureCards(html.join("")) });
});
for (const s of sections.slice(0, 8)) {
  const imgs = cheerio.load(s.html)("img").length;
  console.log(s.heading, "| imgs:", imgs, "| text:", stripText(s.html).length, "| cards:", s.cards.length);
}
