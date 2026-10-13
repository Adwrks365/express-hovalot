import fs from "fs";

const html = fs.readFileSync("audit/tmp-prod-home.html", "utf8");
const footerStart = html.indexOf("elementor-location-footer");
const chunk = html.slice(footerStart, footerStart + 80000);

// strip scripts/styles
const clean = chunk
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "");

const textBlocks = [...clean.matchAll(/elementor-widget-text-editor[\s\S]*?<div class="elementor-widget-container">\s*([\s\S]*?)\s*<\/div>/gi)]
  .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
  .filter(Boolean);

console.log("TEXT BLOCKS:");
textBlocks.forEach((t, i) => console.log(i + 1, t.slice(0, 200)));

// icon-list / nav menu widget titles
const iconLists = [...chunk.matchAll(/elementor-icon-list-text[^>]*>([^<]+)/g)].map((m) => m[1].trim());
console.log("\nICON LIST:", iconLists.slice(0, 10));

// nav menu headings  
const navHeadings = [...chunk.matchAll(/elementor-nav-menu[^>]*>[\s\S]*?<\/nav>/gi)];
console.log("nav menus", navHeadings.length);

// save footer html snippet for manual review
fs.writeFileSync("audit/tmp-footer-snippet.html", chunk.slice(0, 15000));
