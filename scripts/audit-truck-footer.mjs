import fs from "fs";

const html = fs.readFileSync("audit/tmp-prod-home.html", "utf8");

// Truck section CSS from inline stylesheets
const cssBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
const truckCss = cssBlocks
  .flatMap((b) => b.split("}"))
  .filter((r) => /22e046e|352f056|162650a|c7e7a49|bf6de8b/.test(r))
  .map((r) => r.trim() + "}");
console.log("=== TRUCK CSS RULES ===");
console.log(truckCss.join("\n\n"));

// Footer structure
const footerStart = html.indexOf("elementor-location-footer");
const footerHtml = html.slice(footerStart, footerStart + 80000);
const headings = [...footerHtml.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((m) =>
  m[1].replace(/<[^>]+>/g, "").trim(),
);
console.log("\n=== FOOTER HEADINGS ===");
console.log(headings);

const texts = [...footerHtml.matchAll(/elementor-heading-title[^>]*>([^<]+)/g)].map((m) => m[1].trim());
console.log("\n=== FOOTER HEADING TITLES ===");
console.log([...new Set(texts)]);

// copyright / legal
const copy = footerHtml.match(/©[^<]{0,200}/);
console.log("\n=== COPYRIGHT ===", copy?.[0]);

// external links only in footer
const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const links = [];
let m;
while ((m = linkRe.exec(footerHtml)) !== null) {
  const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!text) continue;
  const href = m[1];
  const isExternal = /^https?:\/\//.test(href) && !href.includes("express-hovalot.co.il");
  links.push({ text, href, isExternal });
}
const unique = [];
const seen = new Set();
for (const l of links) {
  const key = l.text + "|" + l.href;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(l);
}
console.log("\n=== UNIQUE FOOTER LINKS ===", unique.length);
console.log(JSON.stringify(unique, null, 2));
