/**
 * Content parity check for the redesigned internal pages.
 * Compares WordPress source (pages.json / posts.json contentHtml) with the locally rendered HTML.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/redesign-parity.ts [baseUrl]
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { resolveMediaById } from "@/lib/media";
import { resolveSourceImageSrc, rewriteSourceHref } from "@/lib/redesign/parse-elementor";

type Item = { requiredNewPath: string; expectedStatus: number; contentType: string };
type Rec = { path: string; title: string; contentHtml: string; type: string; featuredMediaId?: number | null };

/** Site chrome inside <main> that is not page content (sidebar, related posts, post listings, shared widgets). */
const CHROME = '[data-section-type="reviews"], #calculator, [data-redesign-chrome], [data-section-type="posts"], [data-section-type="archive-posts"]';

const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3010";
const contract = JSON.parse(fs.readFileSync("src/content/data/url-contract.json", "utf8")) as { items: Item[] };
const records: Rec[] = [
  ...JSON.parse(fs.readFileSync("src/content/data/pages.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/content/data/posts.json", "utf8")),
];

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
const normPath = (p: string) => {
  const d = decode(p).split("#")[0]!.split("?")[0]!;
  return d.length > 1 ? d.replace(/\/+$/, "") : d;
};
const normText = (s: string) =>
  s
    .replace(/[\u200b\u200e\u200f\u00a0]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

function cleanSource(html: string) {
  const $ = cheerio.load(html || "");
  $(".elementor-hidden-desktop, script, style, noscript, form").remove();
  $(
    [
      ".elementor-widget-form",
      ".elementor-widget-shortcode",
      ".elementor-widget-google_maps",
      ".elementor-widget-spacer",
      ".elementor-widget-divider",
      ".elementor-widget-social-icons",
      ".elementor-widget-star-rating",
      ".elementor-widget-rating",
    ].join(","),
  ).remove();
  $(".elementor-widget-html").each((_, el) => {
    if ($(el).find(".express-hovalot-calculator-container").length) $(el).remove();
  });
  $(".elementor-widget-posts, .elementor-widget-sitemap").remove();
  return $;
}

function sourceSegments($: cheerio.CheerioAPI): string[] {
  const out: string[] = [];
  $(".elementor-counter").remove();
  const blocks = $("h1,h2,h3,h4,h5,h6,p,li,td,th,.elementor-tab-title,.faq-question,.elementor-button-text,.elementor-image-box-description,.elementor-icon-box-description,.elementor-icon-list-text,figcaption,blockquote");
  const seen = new Set<string>();
  blocks.each((_, el) => {
    const $el = $(el);
    if ($el.find("p,li,h1,h2,h3,h4,h5,h6").length) return;
    const text = $el.text().replace(/\s+/g, " ").trim();
    for (const piece of text.split(/(?<=[.!?;:])\s+|\n/)) {
      const n = normText(piece);
      if (n.split(" ").length < 3 || seen.has(n)) continue;
      seen.add(n);
      out.push(n);
    }
  });
  if (!out.length) {
    const n = normText($.root().text());
    if (n) out.push(...n.match(/(?:\S+\s){0,11}\S+/g)!.filter((s) => s.split(" ").length >= 3));
  }
  return out;
}

function renderedImageSrc(src: string): string {
  if (src.startsWith("/_next/image")) {
    const u = new URL(src, "http://x");
    return decode(u.searchParams.get("url") || "");
  }
  return decode(src);
}

const mediaKey = (s: string) => decode(s).split("?")[0]!.split("/").pop()!;

async function fetchHtml(url: string) {
  const res = await fetch(url, { redirect: "manual" });
  return { status: res.status, html: res.status === 200 ? await res.text() : "" };
}

type Result = {
  path: string;
  type: string;
  status: number;
  archetype: string | null;
  renderer: string | null;
  text: { total: number; missing: number; ratio: number; samples: string[] };
  headings: { total: number; missing: string[] };
  media: { source: number; rendered: number; missing: string[]; unrelated: string[] };
  links: { total: number; missing: string[] };
  faq: { source: number; rendered: number };
  tables: { source: number; rendered: number };
  forms: number;
  finalConversion: number;
};

async function main() {
  const items = contract.items.filter((i) => i.expectedStatus === 200 && i.requiredNewPath !== "/");
  const results: Result[] = [];
  for (const item of items) {
    const p = normPath(item.requiredNewPath);
    const url = `${BASE}${encodeURI(p === "/" ? "/" : `${p}/`)}`;
    const { status, html } = await fetchHtml(url);
    const $r = cheerio.load(html);
    const main = $r("main");
    const shell = main.find("[data-renderer]").first();
    const contentOnly = main.clone();
    contentOnly.find(CHROME).remove();
    const renderedText = normText(contentOnly.text());
    const rec = records.find((r) => normPath(r.path) === p);
    const result: Result = {
      path: p,
      type: item.contentType,
      status,
      archetype: shell.attr("data-page-archetype") ?? null,
      renderer: shell.attr("data-renderer") ?? null,
      text: { total: 0, missing: 0, ratio: 1, samples: [] },
      headings: { total: 0, missing: [] },
      media: { source: 0, rendered: 0, missing: [], unrelated: [] },
      links: { total: 0, missing: [] },
      faq: { source: 0, rendered: main.find('[data-section-type="faq"] button[aria-expanded]').length },
      tables: { source: 0, rendered: main.find("table").length },
      forms: main.find("form").length,
      finalConversion: main.find("[data-final-conversion]").length,
    };

    const renderedMedia = new Set<string>();
    main.find("img").each((_, el) => {
      const $el = $r(el);
      if ($el.closest(CHROME).length) return;
      const src = $el.attr("src");
      if (src) renderedMedia.add(mediaKey(renderedImageSrc(src)));
    });
    result.media.rendered = renderedMedia.size;

    if (rec && item.contentType !== "archive") {
      const $s = cleanSource(rec.contentHtml);
      result.faq.source = $s(".elementor-accordion-item, .elementor-toggle-item, .faq-section .faq-item").length;
      result.tables.source = $s("table").length;

      const sourceMedia = new Set<string>();
      $s("img").each((_, el) => {
        const local = resolveSourceImageSrc($s(el).attr("src"));
        if (local) sourceMedia.add(mediaKey(local));
      });
      const settings = $s('[data-element_type="section"]').first().attr("data-settings") || "";
      const bgUrls = [
        ...[...(settings.match(/"background_slideshow_gallery":\[(.*?)\]/)?.[1] ?? "").matchAll(/"url":"([^"]+)"/g)].map((m) => m[1]!),
        settings.match(/"background_image":\{"url":"([^"]+)"/)?.[1],
      ].filter((u): u is string => Boolean(u));
      for (const u of bgUrls) {
        const raw = u.replace(/\\\//g, "/").replace(/\\u([0-9a-f]{4})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)));
        const local = resolveSourceImageSrc(raw);
        if (local) sourceMedia.add(mediaKey(local));
      }
      const featuredLocal = resolveMediaById(rec.featuredMediaId ?? null);
      if (featuredLocal) sourceMedia.add(mediaKey(featuredLocal));
      result.media.source = sourceMedia.size;
      result.media.unrelated = [...renderedMedia].filter((m) => !sourceMedia.has(m));
      result.media.missing = [...sourceMedia].filter((m) => !renderedMedia.has(m) && m !== (featuredLocal ? mediaKey(featuredLocal) : ""));

      const renderedHrefs = new Set<string>();
      main.find("a[href]").each((_, el) => {
        if ($r(el).closest(CHROME).length) return;
        renderedHrefs.add(normPath($r(el).attr("href")!));
      });
      const linkSeen = new Set<string>();
      $s("a[href]").each((_, el) => {
        const raw = $s(el).attr("href")!;
        const href = rewriteSourceHref(raw);
        if (!href || href.startsWith("#") || href.startsWith("tel:") || /wa\.me|whatsapp/.test(href) || href.startsWith("mailto:")) return;
        const key = normPath(href);
        if (linkSeen.has(key)) return;
        linkSeen.add(key);
        result.links.total++;
        if (!renderedHrefs.has(key)) result.links.missing.push(`${$s(el).text().trim().slice(0, 40)} -> ${key}`);
      });

      const $raw = cheerio.load(rec.contentHtml || "");
      const sitemapSource = new Set<string>();
      $raw(".elementor-widget-sitemap a[href]").each((_, el) => {
        const href = rewriteSourceHref($raw(el).attr("href")!);
        if (href && !href.startsWith("#")) sitemapSource.add(normPath(href));
      });
      if (sitemapSource.size) {
        const sitemapRendered = new Set<string>();
        main.find('[data-section-type="sitemap"] a[href]').each((_, el) => {
          sitemapRendered.add(normPath($r(el).attr("href")!));
        });
        const missingSitemap = [...sitemapSource].filter((h) => !sitemapRendered.has(h));
        result.links.total += sitemapSource.size;
        result.links.missing.push(...missingSitemap.map((h) => `sitemap -> ${h}`));
      }

      const headingTexts = new Set<string>();
      $s("h1,h2,h3,h4,h5,h6").each((_, el) => {
        const t = normText($s(el).text());
        if (t) headingTexts.add(t);
      });
      result.headings.total = headingTexts.size;
      result.headings.missing = [...headingTexts].filter((h) => !renderedText.includes(h)).map((h) => h.slice(0, 80));

      const segs = sourceSegments($s);
      const missing = segs.filter((s) => !renderedText.includes(s));
      result.text = {
        total: segs.length,
        missing: missing.length,
        ratio: segs.length ? (segs.length - missing.length) / segs.length : 1,
        samples: missing.slice(0, 6).map((s) => s.slice(0, 90)),
      };
    }
    results.push(result);
    process.stdout.write(".");
  }

  fs.mkdirSync("audit/reports", { recursive: true });
  fs.writeFileSync(path.join("audit/reports", "redesign-parity.json"), JSON.stringify({ base: BASE, generated: new Date().toISOString(), results }, null, 2), "utf8");
  const lines = results.map(
    (r) =>
      `${r.status} ${r.path} | ${r.archetype} | text ${(r.text.ratio * 100).toFixed(1)}% (${r.text.missing}/${r.text.total}) | headings missing ${r.headings.missing.length}/${r.headings.total} | media src ${r.media.source} rend ${r.media.rendered} missing ${r.media.missing.length} unrelated ${r.media.unrelated.length} | links missing ${r.links.missing.length}/${r.links.total} | faq ${r.faq.rendered}/${r.faq.source} | tables ${r.tables.rendered}/${r.tables.source} | forms ${r.forms} | conv ${r.finalConversion}`,
  );
  fs.writeFileSync("tmp/parity-summary.txt", lines.join("\n"), "utf8");
  console.log(`\n${results.length} URLs checked`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
