import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = JSON.parse(fs.readFileSync(path.join(root, "src/content/data/pages.json"), "utf8"));
const posts = JSON.parse(fs.readFileSync(path.join(root, "src/content/data/posts.json"), "utf8"));

const EXCLUDED = new Set([
  "/צרו-קשר",
  "/הצעת-מחיר",
  "/privacy-policy",
  "/terms-of-use",
  "/accessibility-statement",
  "/תודה-רבה",
]);

function norm(p) {
  let s = p;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function serviceContext(pathStr, title) {
  const blob = `${pathStr} ${title}`;
  if (/מנוף|מורכב/.test(blob)) return "crane-special";
  if (/אחסון|אחסנה/.test(blob)) return "storage";
  if (/אריז/.test(blob)) return "packing";
  if (/משרד/.test(blob)) return "office-moving";
  if (/קטנ|פריט|רהיט/.test(blob)) return "small-moves";
  if (/דירה|דירות/.test(blob)) return "apartment-moving";
  if (/מחיר|מחירון/.test(blob)) return "price-quote";
  if (/ירושלים|גבעת|מבשרת|אזור/.test(blob)) return "jerusalem-area";
  return "moving-general";
}

const rows = [];
rows.push("| URL / pattern | page type | popup context | audience | auto enabled? | headline strategy |");
rows.push("| --- | --- | --- | --- | --- | --- |");

rows.push("| `/` | home | moving-general | all visitors | yes (once/session) | general moving headline |");

for (const p of pages) {
  const url = norm(p.path);
  const excluded = EXCLUDED.has(url) || url.startsWith("/category/");
  const ctx = serviceContext(url, p.title);
  const auto = excluded ? "no" : "yes (once/session)";
  const headline =
    ctx === "jerusalem-area" ? "from page title / area name" : `messaging bundle: ${ctx}`;
  rows.push(`| \`${url}\` | page | ${ctx} | service seeker | ${auto} | ${headline} |`);
}

for (const post of posts) {
  const url = norm(post.path);
  const ctx = serviceContext(url, post.title);
  rows.push(`| \`${url}\` | article | ${ctx} | reader | yes (60%/55s, once/session) | topic resolver → ${ctx} |`);
}

rows.push("| `/category/*`, `/tag/*`, `/author/*` | archive | general | — | no | — |");
rows.push("| `/צרו-קשר`, `/הצעת-מחיר` | lead form | price-quote / general | form user | no (manual only) | — |");
rows.push("| `/privacy-policy`, `/terms-of-use`, `/accessibility-statement` | legal | general | — | no | — |");
rows.push("| 404 | not-found | — | — | no | — |");

const out = `# PHASE 2C.1 — Popup context map\n\nGenerated: ${new Date().toISOString()}\n\n${rows.join("\n")}\n`;
fs.mkdirSync(path.join(root, "audit/reports"), { recursive: true });
fs.writeFileSync(path.join(root, "audit/reports/PHASE_2C1_POPUP_CONTEXT_MAP.md"), out);
console.log("Wrote audit/reports/PHASE_2C1_POPUP_CONTEXT_MAP.md", rows.length - 2, "routes");
