/**
 * Read-only production navigation audit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PROD = "https://express-hovalot.co.il/";

function decodeHref(href) {
  try {
    const u = new URL(href, PROD);
    if (!u.hostname.includes("express-hovalot.co.il")) return { href, external: true };
    let p = decodeURIComponent(u.pathname);
    if (p !== "/" && !p.endsWith("/")) p += "/";
    return { href: p, external: false };
  } catch {
    return { href, external: true };
  }
}

function parseMenu($, $root) {
  const items = [];
  $root.children("li").each((_, li) => {
    const $li = $(li);
    const $a = $li.children("a").first();
    const label = $a.text().replace(/\s+/g, " ").trim();
    const { href, external } = decodeHref($a.attr("href") || "");
    const childUl = $li.children("ul").first();
    const node = { label, href, external: !!external };
    if (childUl.length) node.children = parseMenu($, childUl);
    if (label) items.push(node);
  });
  return items;
}

async function main() {
  const res = await fetch(PROD);
  const html = await res.text();
  const $ = cheerio.load(html);

  let menuRoot = null;
  $("nav.elementor-nav-menu--main ul.elementor-nav-menu").each((_, el) => {
    if (!menuRoot) menuRoot = $(el);
  });
  if (!menuRoot?.length) {
    menuRoot = $("ul[id^='menu-']").first();
  }

  const navigation = menuRoot?.length ? parseMenu($, menuRoot) : [];

  const countSubmenus = (items) =>
    items.reduce((n, i) => n + (i.children?.length ? 1 + countSubmenus(i.children) : 0), 0);

  const out = {
    generated: new Date().toISOString(),
    source: PROD,
    topLevelCount: navigation.length,
    submenuParentCount: navigation.filter((i) => i.children?.length).length,
    totalSubmenuItems: navigation.reduce((n, i) => n + (i.children?.length || 0), 0),
    navigation,
  };

  fs.writeFileSync(path.join(ROOT, "audit/reports/production-navigation-parity.json"), JSON.stringify(out, null, 2));

  let md = `# Production Navigation Parity\n\nGenerated: ${out.generated}\n\n`;
  md += `- Top-level items: **${out.topLevelCount}**\n`;
  md += `- Submenu parents: **${out.submenuParentCount}**\n`;
  md += `- Total submenu links: **${out.totalSubmenuItems}**\n\n`;
  md += `## Hierarchy\n\n`;
  for (const item of navigation) {
    md += `- **${item.label}** → \`${item.href}\`${item.external ? " (external)" : ""}\n`;
    for (const child of item.children || []) {
      md += `  - ${child.label} → \`${child.href}\`\n`;
      for (const gc of child.children || []) {
        md += `    - ${gc.label} → \`${gc.href}\`\n`;
      }
    }
  }

  fs.writeFileSync(path.join(ROOT, "audit/reports/PRODUCTION_NAVIGATION_PARITY.md"), md);
  console.log(JSON.stringify({ topLevel: out.topLevelCount, submenuParents: out.submenuParentCount }));
}

main();
