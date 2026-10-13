/**
 * Generates wp-shortlink-redirects.json from pages.json + posts.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function normPath(p) {
  if (!p || p === "/") return "/";
  let d = p.startsWith("/") ? p : `/${p}`;
  if (!d.endsWith("/")) d = `${d}/`;
  return d;
}

const pages = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/pages.json"), "utf8"));
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/posts.json"), "utf8"));

const map = {};
for (const rec of [...pages, ...posts]) {
  if (rec.id && rec.path) map[String(rec.id)] = normPath(rec.path);
}

const out = path.join(ROOT, "src/content/data/wp-shortlink-redirects.json");
fs.writeFileSync(out, JSON.stringify(map, null, 2) + "\n");
console.log("Wrote", out, "entries:", Object.keys(map).length);
