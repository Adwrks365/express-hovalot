import fs from "node:fs";
import * as cheerio from "cheerio";

const data = JSON.parse(fs.readFileSync("src/content/data/homepage-source.json", "utf8"));
const $ = cheerio.load(data.contentHtml || "");

const sections = [];
$("section.elementor-section").each((i, el) => {
  const heading = $(el).find("h1,h2,h3").first().text().replace(/\s+/g, " ").trim();
  const imgs = [];
  $(el).find("img").each((_, img) => {
    imgs.push({ src: $(img).attr("src"), alt: $(img).attr("alt") || "" });
  });
  if (heading || imgs.length) {
    sections.push({ index: i, heading: heading.slice(0, 80), imgCount: imgs.length, imgs: imgs.slice(0, 6) });
  }
});

const cssVars = [...data.contentHtml.matchAll(/--e-global-color-[a-z0-9]+:\s*([^;"']+)/gi)].map((m) => m[0]);
const globalColors = [...new Set(cssVars)];

console.log(JSON.stringify({ sectionCount: sections.length, globalColors, sections: sections.slice(0, 25) }, null, 2));
