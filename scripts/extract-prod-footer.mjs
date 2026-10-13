import fs from "fs";

const html = fs.readFileSync("audit/tmp-prod-home.html", "utf8");

const footerIdx = html.indexOf("elementor-location-footer");
const siteFooterIdx = html.indexOf('data-elementor-type="footer"');
const start = footerIdx > -1 ? footerIdx : siteFooterIdx > -1 ? siteFooterIdx : html.length - 30000;
const chunk = html.slice(start, start + 50000);

const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const links = [];
let m;
while ((m = linkRe.exec(chunk)) !== null) {
  const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (text) links.push({ text, href: m[1] });
}

console.log(JSON.stringify({ start, linkCount: links.length, links }, null, 2));
