/**
 * Trace every rendered counter back to Elementor data-to-value in the page source.
 * Usage: npx tsx --tsconfig tsconfig.json scripts/phase-2b7b-stats.ts [http://localhost:3010]
 */
import fs from "node:fs";
import * as cheerio from "cheerio";
import { composePage } from "@/lib/redesign/compose";

const LOCAL = process.argv.find((a) => a.startsWith("http")) || "http://localhost:3010";

type Rec = { path: string; title: string; contentHtml: string };
const records: Rec[] = [
  ...JSON.parse(fs.readFileSync("src/content/data/pages.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/content/data/posts.json", "utf8")),
];

function normPath(p: string) {
  const d = decodeURIComponent(p.split("#")[0]!.split("?")[0]!);
  return d === "" || d === "/" ? "/" : `${d.replace(/\/+$/, "")}/`;
}

function sourceCounters(html: string) {
  const $ = cheerio.load(html || "");
  const out: { label: string; sourceValue: string; prefix: string; suffix: string; location: string }[] = [];
  $(".elementor-counter-number").each((_, el) => {
    const $el = $(el);
    const raw = ($el.attr("data-to-value") || "").trim();
    if (!/^\d+(\.\d+)?$/.test(raw)) return;
    const wrap = $el.closest(".elementor-counter");
    const label = wrap.find(".elementor-counter-title").text().replace(/\s+/g, " ").trim();
    const prefix = wrap.find(".elementor-counter-number-prefix").text().replace(/\s+/g, " ").trim();
    const suffix = wrap.find(".elementor-counter-number-suffix").text().replace(/\s+/g, " ").trim();
    const delimiter = $el.attr("data-delimiter") || "";
    const sourceValue =
      delimiter === "," && /^\d+$/.test(raw) && raw.length > 3 ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : raw;
    out.push({ label, sourceValue, prefix, suffix, location: "elementor-counter data-to-value" });
  });
  return out;
}

type Row = {
  url: string;
  label: string;
  sourceValue: string;
  renderedValue: string;
  sourceLocation: string;
  verified: boolean;
};

function main() {
  const rows: Row[] = [];
  for (const rec of records) {
    const url = normPath(rec.path);
    const source = sourceCounters(rec.contentHtml);
    const model = composePage({ title: rec.title, contentHtml: rec.contentHtml });
    const rendered = model.blocks.filter((b) => b.type === "stats").flatMap((b) => b.items);
    const used = new Set<number>();
    for (const item of rendered) {
      const matchIdx = source.findIndex((s, i) => !used.has(i) && s.label === item.label && s.sourceValue === item.value);
      const match = matchIdx >= 0 ? source[matchIdx] : source.find((s, i) => !used.has(i) && s.sourceValue === item.value);
      if (matchIdx >= 0) used.add(matchIdx);
      else if (match) used.add(source.indexOf(match));
      rows.push({
        url,
        label: item.label,
        sourceValue: match?.sourceValue ?? "",
        renderedValue: `${item.prefix === "%" ? "" : item.prefix}${item.value}${item.prefix === "%" ? "%" : item.suffix}`,
        sourceLocation: match?.location ?? "NONE",
        verified: Boolean(match && match.sourceValue === item.value),
      });
    }
  }

  const unverified = rows.filter((r) => !r.verified);
  const report = {
    generated: new Date().toISOString(),
    local: LOCAL,
    method: "Rendered stats come only from Elementor data-to-value. Inner (animated) text is never used.",
    totals: {
      counters: rows.length,
      verified: rows.filter((r) => r.verified).length,
      UNVERIFIED_STATISTICS: unverified.length,
    },
    counters: rows,
    unverified,
  };
  fs.mkdirSync("audit/reports", { recursive: true });
  fs.writeFileSync("audit/reports/PHASE_2B7B_STAT_SOURCE_AUDIT.json", JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report.totals));
}

main();
