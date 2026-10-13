/**
 * PHASE 2C.0C — Hero consistency audit (local preview)
 */
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "audit/reports");
const LOCAL = process.env.LOCAL_BASE || "http://localhost:3010";
const archetypes = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/page-archetypes.json"), "utf8"));

const EXCLUDED = new Set(["ARTICLE", "ARCHIVE", "LANDING_THANKYOU"]);
const NO_FORM_PATHS = new Set([
  "/צרו-קשר/",
  "/הצעת-מחיר/",
  "/terms-of-use/",
  "/privacy-policy/",
  "/accessibility-statement/",
  "/site-map/",
  "/תודה-רבה/",
  "/שגיאה-404-1/",
  "/שגיאה-404-2/",
]);

function normPath(p) {
  let d = p;
  try {
    d = decodeURIComponent(p);
  } catch {
    /* */
  }
  if (!d.startsWith("/")) d = `/${d}`;
  if (d !== "/" && !d.endsWith("/")) d = `${d}/`;
  return d;
}

const APPLICABLE = (archetypes.entries || []).filter((e) => {
  const p = normPath(e.path);
  if (EXCLUDED.has(e.archetype)) return false;
  if (NO_FORM_PATHS.has(p)) return false;
  return ["SERVICE", "AREA", "STORAGE", "INFORMATION", "ABOUT", "FAQ", "PRICING", "QUOTE", "CONTACT"].includes(e.archetype) || e.archetype === "PAGE";
});

async function auditUrl(pathStr) {
  const url = `${LOCAL}${encodeURI(pathStr).replace(/%2F/g, "/")}`;
  const res = await fetch(url, { headers: { "user-agent": "2C0C-hero-audit" } });
  const html = res.status === 200 ? await res.text() : "";
  const $ = cheerio.load(html);
  const hero = $("[data-redesign-hero]").first();
  const legacyCard = hero.text().includes("אקספרס הובלות") && hero.find('[data-hero-panel]').length > 0;
  const heroForm = hero.find("[data-hero-quick-quote]").length > 0;
  const phoneCount = hero.find('a[href^="tel:"]').length;
  const quoteButtons = hero
    .find("a, button")
    .filter((_, el) => /הצעת מחיר|קבלו הצעת מחיר/.test($(el).text()) && !$(el).closest("[data-hero-quick-quote]").length)
    .length;
  const quickStrip = $("[data-quick-lead-strip]").length;

  return {
    url: pathStr,
    httpStatus: res.status,
    heroForm,
    legacyHeroCtaCard: legacyCard,
    duplicateHeroPhoneActions: phoneCount > 1 ? phoneCount : 0,
    duplicateHeroQuoteActions: quoteButtons,
    quickLeadStripBelowHero: quickStrip > 0,
    status:
      legacyCard || quickStrip > 0 || quoteButtons > 0
        ? "NEEDS_FIX"
        : heroForm
          ? "OK"
          : "NO_FORM",
  };
}

const rows = [];
for (const entry of APPLICABLE) {
  const pathStr = normPath(entry.path);
  process.stdout.write(".");
  rows.push({ archetype: entry.archetype, ...(await auditUrl(pathStr)) });
}
console.log("\nAudited:", rows.length);

const summary = {
  LEGACY_HERO_CTA_CARD: rows.filter((r) => r.legacyHeroCtaCard).length,
  DUPLICATE_HERO_PHONE_ACTION: rows.filter((r) => r.duplicateHeroPhoneActions > 0).length,
  DUPLICATE_HERO_QUOTE_ACTION: rows.filter((r) => r.duplicateHeroQuoteActions > 0).length,
  HERO_FORM_PRESENT: rows.filter((r) => r.heroForm).length,
  QUICK_LEAD_STRIP: rows.filter((r) => r.quickLeadStripBelowHero).length,
};

fs.writeFileSync(
  path.join(OUT, "PHASE_2C0C_HERO_CONSISTENCY.json"),
  JSON.stringify({ generated: new Date().toISOString(), summary, rows }, null, 2),
);

console.log(JSON.stringify(summary));
