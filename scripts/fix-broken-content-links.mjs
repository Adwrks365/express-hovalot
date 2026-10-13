/**
 * Replace legacy/broken internal URLs in content JSON (one-time fixer, safe to re-run).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const REPLACEMENTS = [
  [/https?:\/\/express-hovalot\.co\.il\/%d7%a4%d7%aa%d7%a8%d7%95%d7%a0%d7%95%d7%aa-%d7%90%d7%97%d7%a1%d7%a0%d7%94\/?/gi, "/אחסון-תכולה-בירושלים/"],
  [/https?:\/\/express-hovalot\.co\.il\/פתרונות-אחסנה\/?/gi, "/אחסון-תכולה-בירושלים/"],
  [/https?:\/\/express-hovalot\.co\.il\/contact-us\/?/gi, "/צרו-קשר/"],
  [/href=["']\/contact-us\/?["']/gi, 'href="/צרו-קשר/"'],
  [/href=\\["']\/privacy-policy\\["']/gi, 'href=\\"/privacy-policy/\\"'],
  [/href=\\["']\/terms-of-use\\["']/gi, 'href=\\"/terms-of-use/\\"'],
  [/href=\\["']\/accessibility-statement\\["']/gi, 'href=\\"/accessibility-statement/\\"'],
  [/href=\\["']\/site-map\\["']/gi, 'href=\\"/site-map/\\"'],
  [/href=["']\/privacy-policy["']/gi, 'href="/privacy-policy/"'],
  [/href=["']\/terms-of-use["']/gi, 'href="/terms-of-use/"'],
  [/href=["']\/accessibility-statement["']/gi, 'href="/accessibility-statement/"'],
  [/href=["']\/site-map["']/gi, 'href="/site-map/"'],
  [/https?:\/\/express-hovalot\.co\.il\/%d7%a9%d7%92%d7%99%d7%90%d7%94-404-[12]\/?/gi, "/"],
];

function patchFile(rel) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) return 0;
  let s = fs.readFileSync(fp, "utf8");
  let n = 0;
  for (const [re, rep] of REPLACEMENTS) {
    const before = s;
    s = s.replace(re, () => {
      n++;
      return rep;
    });
    if (s === before) continue;
  }
  if (n) fs.writeFileSync(fp, s);
  return n;
}

const files = [
  "src/content/data/pages.json",
  "src/content/data/posts.json",
  "src/content/data/homepage-source.json",
];

let total = 0;
for (const f of files) total += patchFile(f);
console.log("Replacements applied:", total);
