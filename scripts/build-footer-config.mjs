import fs from "fs";

const html = fs.readFileSync("audit/tmp-prod-home.html", "utf8");
const footerStart = html.indexOf("elementor-location-footer");
const chunk = html.slice(footerStart);

// decode production URL to local path
function toLocalPath(href) {
  if (!href || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("javascript")) return href;
  if (href.includes("cdn-cgi")) return null;
  try {
    const u = new URL(href, "https://express-hovalot.co.il");
    if (!u.hostname.includes("express-hovalot.co.il")) return href;
    let p = decodeURIComponent(u.pathname);
    if (p.endsWith("/") && p.length > 1) p = p.slice(0, -1);
    if (p === "") return "/";
    if (p.startsWith("#")) return p;
    return p;
  } catch {
    return href;
  }
}

const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const links = [];
let m;
while ((m = linkRe.exec(chunk)) !== null) {
  const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 2) continue;
  links.push({ text, href: m[1], local: toLocalPath(m[1]) });
}

// unique by text+href
const seen = new Set();
const unique = links.filter((l) => {
  const k = l.text + l.href;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

// nav menu items - look for menu links
const navMenus = [...chunk.matchAll(/elementor-nav-menu[^>]*>([\s\S]*?)<\/nav>/gi)].map((m) => {
  const items = [];
  const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let mm;
  while ((mm = re.exec(m[1])) !== null) {
    const text = mm[2].replace(/<[^>]+>/g, "").trim();
    if (text) items.push({ text, href: mm[1], local: toLocalPath(mm[1]) });
  }
  return items;
});

console.log(JSON.stringify({ navMenus, uniqueCount: unique.length, unique }, null, 2));
