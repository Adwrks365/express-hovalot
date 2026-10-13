/**
 * Phase 2B.7 global QA: same-page / cross-page duplication, headings, FAQ + schema, forms, tel links,
 * SEO head parity with production, and browser checks (overflow, broken images, header overlap,
 * floating-control overlap, mobile tap targets).
 *
 * Production HTML comes from the read-only cache written by scripts/link-graph.ts (tmp/prod-cache).
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/phase-2b7-qa.ts [localBase] [--no-browser]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

const LOCAL = process.argv.find((a) => a.startsWith("http")) || "http://localhost:3010";
const BROWSER = !process.argv.includes("--no-browser");
const CACHE = "tmp/prod-cache";

type Item = { requiredNewPath: string; expectedStatus: number; contentType: string };
type Rec = { path: string; title: string; contentHtml: string; featuredMediaId?: number | null };
const contract = JSON.parse(fs.readFileSync("src/content/data/url-contract.json", "utf8")) as { items: Item[] };
const records: Rec[] = [
  ...JSON.parse(fs.readFileSync("src/content/data/pages.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/content/data/posts.json", "utf8")),
];
const postPaths = new Set((JSON.parse(fs.readFileSync("src/content/data/posts.json", "utf8")) as Rec[]).map((p) => normPath(p.path)));

const is404Template = (p: string) => /^\/שגיאה-404-\d\/?$/.test(safeDecode(p));
const paths = ["/", ...contract.items.filter((i) => i.expectedStatus === 200 && i.requiredNewPath !== "/" && !is404Template(i.requiredNewPath)).map((i) => i.requiredNewPath)];

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
function normPath(p: string) {
  const d = safeDecode(p.split("#")[0]!.split("?")[0]!);
  return d === "" || d === "/" ? "/" : `${d.replace(/\/+$/, "")}/`;
}
const norm = (s: string) =>
  s
    .replace(/[\u200b\u200e\u200f\u00a0]/g, " ")
    .replace(/[״"“”']/g, "")
    .replace(/[^\p{L}\p{N}%+]+/gu, " ")
    .trim()
    .toLowerCase();

function prodHtml(p: string): string | null {
  const file = path.join(CACHE, `${crypto.createHash("md5").update(p).digest("hex")}.html`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

/** Site chrome inside <main> that is shared, not page content. */
const LOCAL_CHROME =
  '[aria-hidden="true"], .sr-only, script, style, noscript, template, [data-redesign-chrome], [data-section-type="reviews"], #calculator, [data-section-type="posts"], [data-section-type="archive-posts"], nav[aria-label="תוכן עניינים"], nav[aria-label="breadcrumb"], .md\\:hidden, .lg\\:hidden';
const UNIT = "p, li, h1, h2, h3, h4, h5, h6, dt, dd, blockquote, figcaption";

function units($: cheerio.CheerioAPI, scope: cheerio.Cheerio<never>): { tag: string; text: string }[] {
  const out: { tag: string; text: string }[] = [];
  scope.find(UNIT).each((_, el) => {
    const $el = $(el);
    const text = norm($el.text());
    if (!text) return;
    const tag = (el as { tagName: string }).tagName.toLowerCase();
    const isHeading = /^h\d$/.test(tag);
    if (!isHeading && text.length < 25) return;
    if (isHeading && text.length < 4) return;
    const parentUnit = $el.parent().closest(UNIT);
    if (parentUnit.length && norm(parentUnit.text()) === text) return;
    out.push({ tag, text });
  });
  return out;
}

function countIn(haystack: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i >= 0) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

function mediaKey(src: string): string {
  let s = src;
  if (s.includes("/_next/image")) {
    const u = new URL(s, LOCAL);
    s = u.searchParams.get("url") || s;
  }
  const file = s.split("?")[0]!;
  let base = safeDecode(file.split("/").pop() || "");
  if (file.includes("/thumbs/")) base = base.replace(/-[a-z0-9]{20,}(?=\.)/i, "");
  return base.replace(/-\d+x\d+(?=\.)/, "").replace(/-scaled(?=\.)/, "").replace(/\.(webp|jpe?g|png|gif|svg|avif)$/i, "").toLowerCase();
}
/** Comparable media identity: local files are `{wpId}-{slug}` with `_xx` byte escapes, production files are `{slug}`. */
const mediaSlug = (k: string) =>
  safeDecode(k.replace(/^\d+-/, "").replace(/(?:_[0-9a-f]{2}){2,}/gi, (run) => run.replace(/_/g, "%")))
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]/g, "");
const unescapeUnicode = (s: string) => s.replace(/\\u([0-9a-f]{4})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)));

type PageResult = {
  url: string;
  status: number;
  h1Count: number;
  h1: string[];
  headingWarnings: string[];
  duplicatedText: { text: string; tag: string; local: number; production: number; classification: string }[];
  duplicatedHeadings: { text: string; local: number; production: number; classification: string }[];
  duplicatedMedia: { media: string; local: number; production: number; classification: string }[];
  cta: { heroConversionButtons: number; openingStripAfterHero: boolean; strips: number; quietStrips: number; finalConversion: number; heroCtaStack: boolean };
  forms: { total: number; orphan: string[] };
  faq: { visible: number; duplicates: string[]; schemaQuestions: number; schemaNotVisible: string[]; visibleNotInSchema: string[]; productionHasFaqSchema: boolean };
  toc: { entries: number; missingTargets: string[]; textMismatch: string[] } | null;
  telLinks: { total: number; malformed: string[] };
  unrelatedMedia: string[];
  seo: Record<string, { local: string | null; production: string | null; match: boolean }>;
  schemaTypes: { local: string[]; production: string[] };
  actionsTaken: string[];
};

const ACTIONS: Record<string, string[]> = {
  "/": [
    "Removed FAQ intro box that repeated the trust-block headline and the first FAQ answer (production shows each once)",
  ],
};

function schemaTypes($: cheerio.CheerioAPI): { types: string[]; faq: string[] } {
  const types: string[] = [];
  const faq: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const nodes = (Array.isArray(data) ? data : data["@graph"] ?? [data]) as Record<string, unknown>[];
      for (const n of nodes) {
        const t = n["@type"];
        (Array.isArray(t) ? t : [t]).forEach((x) => x && types.push(String(x)));
        if (t === "FAQPage" && Array.isArray(n.mainEntity)) {
          for (const q of n.mainEntity as { name?: string }[]) if (q.name) faq.push(q.name);
        }
      }
    } catch {
      types.push("INVALID_JSON");
    }
  });
  return { types: [...new Set(types)].sort(), faq };
}

function head($: cheerio.CheerioAPI) {
  const canonical = $('link[rel="canonical"]').attr("href") ?? null;
  return {
    title: $("title").first().text().trim() || null,
    description: $('meta[name="description"]').attr("content")?.trim() ?? null,
    canonical: canonical ? normPath(new URL(canonical, "https://express-hovalot.co.il").pathname) : null,
    robots: (() => {
      const r = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
      return r.includes("noindex") ? "noindex" : "index";
    })(),
  };
}

async function staticPass(): Promise<{ pages: PageResult[]; crossPage: unknown[] }> {
  const pages: PageResult[] = [];
  const localUnitPages = new Map<string, Set<string>>();
  const prodTexts = new Map<string, string>();
  const conversionTexts = new Set<string>();

  for (const p of paths) {
    const url = normPath(p);
    const res = await fetch(LOCAL + encodeURI(url));
    const html = await res.text();
    const $ = cheerio.load(html);
    const prodRaw = prodHtml(p);
    const $p = prodRaw ? cheerio.load(prodRaw) : null;
    const prodSchema = $p ? schemaTypes($p) : { types: [], faq: [] };
    const ph = $p ? head($p) : null;

    /* ---------- production content scope ---------- */
    let prodText = "";
    const prodMedia: string[] = [];
    if ($p) {
      $p("script, style, noscript, .elementor-hidden-desktop").remove();
      const scope = $p('[data-elementor-type="wp-page"], [data-elementor-type="wp-post"], .entry-content, #content, main').first();
      prodText = ` ${norm(scope.text())} `;
      scope.find("img").each((_, el) => {
        const s = $p(el).attr("data-src") || $p(el).attr("src");
        if (s && !s.startsWith("data:")) prodMedia.push(mediaSlug(mediaKey(s)));
      });
      prodTexts.set(url, prodText);
    }

    /* ---------- local content scope ---------- */
    const $main = $("main").first().clone();
    $main.find(LOCAL_CHROME).remove();
    units($, $main.find("[data-final-conversion]") as never).forEach((u) => conversionTexts.add(u.text));
    const local = units($, $main as never);
    const counts = new Map<string, { tag: string; n: number }>();
    for (const u of local) {
      const c = counts.get(u.text) ?? { tag: u.tag, n: 0 };
      c.n++;
      counts.set(u.text, c);
      if (!localUnitPages.has(u.text)) localUnitPages.set(u.text, new Set());
      localUnitPages.get(u.text)!.add(url);
    }
    const duplicatedText: PageResult["duplicatedText"] = [];
    const duplicatedHeadings: PageResult["duplicatedHeadings"] = [];
    for (const [text, { tag, n }] of counts) {
      if (n < 2) continue;
      const production = countIn(prodText, ` ${text} `) || countIn(prodText, text);
      const classification = production >= n ? "SOURCE_REPEAT_PRESERVED" : "ACCIDENTAL_SAME_PAGE_DUPLICATION";
      if (/^h\d$/.test(tag)) duplicatedHeadings.push({ text, local: n, production, classification });
      else duplicatedText.push({ text: text.slice(0, 140), tag, local: n, production, classification });
    }

    /* ---------- media ---------- */
    const mediaCounts = new Map<string, number>();
    $main.find("img").each((_, el) => {
      const s = $(el).attr("src");
      if (!s || s.startsWith("data:")) return;
      const k = mediaKey(s);
      mediaCounts.set(k, (mediaCounts.get(k) ?? 0) + 1);
    });
    const duplicatedMedia: PageResult["duplicatedMedia"] = [];
    for (const [k, n] of mediaCounts) {
      if (n < 2) continue;
      const production = prodMedia.filter((m) => m === mediaSlug(k)).length;
      duplicatedMedia.push({ media: k, local: n, production, classification: production >= n ? "SOURCE_REPEAT_PRESERVED" : "ACCIDENTAL_SAME_PAGE_DUPLICATION" });
    }

    /* ---------- unrelated media (content pages only) ---------- */
    const rec = records.find((r) => normPath(r.path) === url);
    const unrelatedMedia: string[] = [];
    if (rec && url !== "/") {
      const source = rec.contentHtml.toLowerCase();
      const sourceFlat = safeDecode(unescapeUnicode(rec.contentHtml).replace(/\\\//g, "/")).toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]/g, "");
      for (const k of mediaCounts.keys()) {
        const id = k.match(/^(\d+)-/)?.[1];
        const slug = mediaSlug(k);
        const owned =
          (id && (new RegExp(`\\b${id}\\b`).test(source) || Number(id) === rec.featuredMediaId)) ||
          (slug.length > 3 && sourceFlat.includes(slug)) ||
          new RegExp(`/(?:thumbs/)?${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:-[a-z0-9]+)*\\.(?:webp|jpe?g|png|gif|svg)`, "i").test(safeDecode(source)) ||
          prodMedia.includes(slug);
        if (!owned) unrelatedMedia.push(k);
      }
    }

    /* ---------- headings ---------- */
    const h1 = $("h1").map((_, el) => $(el).text().replace(/\s+/g, " ").trim()).get();
    const headingWarnings: string[] = [];
    let prevLevel = 1;
    let seenH2 = false;
    $("main")
      .find("h2, h3, h4, h5, h6")
      .each((_, el) => {
        if ($(el).closest('.sr-only, [aria-hidden="true"]').length && !$(el).is(".sr-only")) return;
        const level = Number((el as { tagName: string }).tagName[1]);
        const text = $(el).text().replace(/\s+/g, " ").trim().slice(0, 60);
        if (level === 2) seenH2 = true;
        if (level === 3 && !seenH2) headingWarnings.push(`h3 before any h2: "${text}"`);
        if (level > prevLevel + 1) headingWarnings.push(`skip h${prevLevel}→h${level}: "${text}"`);
        prevLevel = level;
      });

    /* ---------- CTA ---------- */
    const hero = $("[data-redesign-hero], [data-home-hero]").first();
    const heroConversionButtons = hero.find('a[href^="tel:"], a[href="#contact"], a[href*="wa.me"], a[href*="הצעת-מחיר"]').filter((_, a) => !$(a).closest("nav").length && !$(a).closest("[data-hero-panel]").length).length;
    const heroPanel = hero.find("[data-hero-panel]").length;
    const afterHero = hero.nextAll("section, div").first();
    const openingStripAfterHero = afterHero.is('[data-section-type="cta-strip"]') || afterHero.find('> [data-section-type="cta-strip"]').length > 0;
    const strips = $('main [data-section-type="cta-strip"]');
    const quietStrips = strips.filter((_, s) => $(s).find('[data-cta-variant="quiet"]').length > 0).length;
    const finalConversion = $("main [data-final-conversion]").length;
    const cta = {
      heroConversionButtons: heroConversionButtons + heroPanel,
      openingStripAfterHero,
      strips: strips.length,
      quietStrips,
      finalConversion,
      heroCtaStack: openingStripAfterHero && heroConversionButtons + heroPanel > 0,
    };

    /* ---------- forms ---------- */
    const formsAll = $("main form");
    const orphan: string[] = [];
    formsAll.each((_, f) => {
      if ($(f).closest("[data-final-conversion], #contact, [data-home-hero], [data-section-type='contact-main'], #calculator").length) return;
      orphan.push($(f).attr("aria-label") || "form");
    });

    /* ---------- FAQ ---------- */
    const visibleQ = $("main button[aria-expanded][aria-controls]")
      .filter((_, b) => !$(b).closest('nav, [data-redesign-chrome], #calculator').length)
      .map((_, b) => $(b).text().replace(/[+−-]\s*$/, "").replace(/\s+/g, " ").trim())
      .get()
      .filter(Boolean);
    const qCount = new Map<string, number>();
    visibleQ.forEach((q) => qCount.set(norm(q), (qCount.get(norm(q)) ?? 0) + 1));
    const { types: localTypes, faq: schemaQ } = schemaTypes($);
    const visibleSet = new Set(visibleQ.map(norm));
    const schemaSet = new Set(schemaQ.map(norm));
    const faq = {
      visible: visibleQ.length,
      duplicates: [...qCount].filter(([, n]) => n > 1).map(([q]) => q),
      schemaQuestions: schemaQ.length,
      schemaNotVisible: schemaQ.filter((q) => !visibleSet.has(norm(q))),
      visibleNotInSchema: schemaQ.length ? visibleQ.filter((q) => !schemaSet.has(norm(q))) : [],
      productionHasFaqSchema: prodSchema.types.includes("FAQPage"),
    };

    /* ---------- TOC ---------- */
    let toc: PageResult["toc"] = null;
    const tocLinks = $('nav[aria-label="תוכן עניינים"] a[href^="#"]');
    if (tocLinks.length || postPaths.has(url)) {
      const missingTargets: string[] = [];
      const textMismatch: string[] = [];
      tocLinks.each((_, a) => {
        const id = safeDecode($(a).attr("href")!.slice(1));
        const target = $(`[id="${id.replace(/"/g, '\\"')}"]`);
        if (!target.length) missingTargets.push(id);
        else if (norm(target.text()) !== norm($(a).text())) textMismatch.push(`${$(a).text().trim()} ≠ ${target.text().trim()}`);
      });
      toc = { entries: tocLinks.length, missingTargets, textMismatch };
    }

    /* ---------- tel ---------- */
    const tel = $('a[href^="tel:"]').map((_, a) => $(a).attr("href")!).get();
    const telLinks = { total: tel.length, malformed: tel.filter((h) => !/^tel:(\+972|0)\d{8,9}$/.test(h)) };

    /* ---------- SEO ---------- */
    const lh = head($);
    const seo: PageResult["seo"] = {};
    for (const k of ["title", "description", "canonical", "robots"] as const) {
      const a = lh[k];
      const b = ph ? ph[k] : null;
      seo[k] = { local: a, production: b, match: ph ? norm(a ?? "") === norm(b ?? "") : true };
    }
    const prodH1 = $p ? $p("h1").first().text().replace(/\s+/g, " ").trim() : null;
    seo.h1 = { local: h1[0] ?? null, production: prodH1, match: !prodH1 || norm(h1[0] ?? "") === norm(prodH1) };

    pages.push({
      url,
      status: res.status,
      h1Count: h1.length,
      h1,
      headingWarnings,
      duplicatedText,
      duplicatedHeadings,
      duplicatedMedia,
      cta,
      forms: { total: formsAll.length, orphan },
      faq,
      toc,
      telLinks,
      unrelatedMedia,
      seo,
      schemaTypes: { local: localTypes, production: prodSchema.types },
      actionsTaken: ACTIONS[url] ?? [],
    });
    process.stdout.write(".");
  }

  /* ---------- cross-page duplication ---------- */
  const crossPage: { text: string; localPages: number; productionPages: number; classification: string; sample: string[] }[] = [];
  for (const [text, set] of localUnitPages) {
    if (set.size < 3 || text.length < 30) continue;
    const prodPages = [...set].filter((u) => (prodTexts.get(u) ?? "").includes(text)).length;
    const classification =
      prodPages >= set.size
        ? "GLOBAL_BUSINESS_COPY"
        : conversionTexts.has(text)
          ? "GLOBAL_CONVERSION_COMPONENT_COPY"
          : prodPages === 0
            ? "DESIGN_SYSTEM_INJECTED"
            : "PARTIAL_SOURCE_COPY";
    crossPage.push({ text: text.slice(0, 140), localPages: set.size, productionPages: prodPages, classification, sample: [...set].slice(0, 5) });
  }
  crossPage.sort((a, b) => b.localPages - a.localPages);
  return { pages, crossPage };
}

type BrowserResult = { url: string; width: number; overflow: boolean; brokenImages: string[]; headerOverlap: string[]; fixedOverlap: string[]; smallTapTargets: string[]; menuControlsHidden: boolean | null };

async function browserPass(widths = [1440, 390]): Promise<BrowserResult[]> {
  const out: BrowserResult[] = [];
  const browser = await chromium.launch();
  for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: width > 1000 ? 900 : 844 }, deviceScaleFactor: 1, hasTouch: width < 1000 });
    await ctx.addInitScript("window.__name = (fn) => fn;");
    for (const p of paths) {
      const url = normPath(p);
      const page = await ctx.newPage();
      await page.goto(LOCAL + encodeURI(url), { waitUntil: "load" });
      await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
      const r = await page.evaluate(async () => {
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
        const H = window.innerHeight;
        const intersects = (a: DOMRect, b: DOMRect) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
        const fixedOverlap = new Set<string>();
        const targets = 'main form input, main form button, main form textarea, main form select, [data-section-type="cta-strip"] a, [data-final-conversion] a, [data-final-conversion] button, footer a, footer button, footer input';
        const label = (el: Element) => `${el.tagName.toLowerCase()}:${(el.textContent || (el as HTMLInputElement).placeholder || el.getAttribute("aria-label") || "").trim().slice(0, 30)}`;
        const total = document.documentElement.scrollHeight;
        for (let y = 0; y <= total; y += Math.round(H * 0.45)) {
          window.scrollTo(0, y);
          await sleep(260);
          const fabs = [...document.querySelectorAll("[data-fixed-control] > *")].filter((el) => {
            let n: Element | null = el;
            while (n) {
              const cs = getComputedStyle(n);
              if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return false;
              n = n.parentElement;
            }
            return el.getBoundingClientRect().width > 0;
          });
          if (!fabs.length) continue;
          const rects = fabs.map((f) => f.getBoundingClientRect());
          document.querySelectorAll(targets).forEach((t) => {
            const tr = t.getBoundingClientRect();
            if (tr.width === 0 || tr.bottom < 0 || tr.top > H) return;
            if (getComputedStyle(t).visibility === "hidden") return;
            if (rects.some((fr) => intersects(fr, tr))) fixedOverlap.add(label(t));
          });
        }
        window.scrollTo(0, total);
        await sleep(400);
        window.scrollTo(0, 0);
        await sleep(200);
        const brokenImages = [...document.images]
          .filter((img) => img.complete && img.naturalWidth === 0 && img.getBoundingClientRect().width > 0)
          .map((img) => img.currentSrc || img.src);
        const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;

        const headerOverlap: string[] = [];
        const header = document.querySelector("header")!;
        const anchors = [...new Set(["contact", ...[...document.querySelectorAll('nav[aria-label="תוכן עניינים"] a[href^="#"]')].slice(0, 3).map((a) => decodeURIComponent(a.getAttribute("href")!.slice(1)))])];
        for (const id of anchors) {
          const el = document.getElementById(id);
          if (!el) continue;
          el.scrollIntoView({ block: "start" });
          await sleep(120);
          const hb = header.getBoundingClientRect().bottom;
          const top = el.getBoundingClientRect().top;
          if (top < hb - 1) headerOverlap.push(`#${id} top ${Math.round(top)} < header ${Math.round(hb)}`);
        }
        window.scrollTo(0, 0);

        const smallTapTargets: string[] = [];
        if (window.innerWidth < 500) {
          header.querySelectorAll("a, button").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || getComputedStyle(el).display === "none") return;
            if (r.height < 42 || r.width < 42) smallTapTargets.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
          });
        }
        return { overflow, brokenImages, headerOverlap, fixedOverlap: [...fixedOverlap], smallTapTargets };
      });
      let menuControlsHidden: boolean | null = null;
      if (width < 1000 && (url === "/" || url.includes("about"))) {
        await page.evaluate(() => window.scrollTo(0, 900));
        await page.waitForTimeout(300);
        await page.click("button[aria-controls=mobile-nav]");
        await page.waitForTimeout(300);
        menuControlsHidden = await page.evaluate(() => [...document.querySelectorAll(".fixed-controls")].every((el) => getComputedStyle(el).display === "none"));
      }
      out.push({ url, width, ...r, menuControlsHidden });
      await page.close();
      process.stdout.write(width > 1000 ? "+" : "-");
    }
    await ctx.close();
  }
  await browser.close();
  return out;
}

async function main() {
  const extraWidths = process.argv.find((a) => a.startsWith("--widths="));
  if (extraWidths) {
    const results = await browserPass(extraWidths.slice(9).split(",").map(Number));
    fs.writeFileSync("tmp/qa-2b7-widths.json", JSON.stringify(results.filter((b) => b.overflow || b.fixedOverlap.length || b.smallTapTargets.length || b.headerOverlap.length || b.brokenImages.length || b.menuControlsHidden === false), null, 1), "utf8");
    console.log(`\n${results.length} page-widths checked`);
    return;
  }
  const { pages, crossPage } = await staticPass();
  const browser = BROWSER ? await browserPass() : [];

  const sum = (f: (p: PageResult) => number) => pages.reduce((a, p) => a + f(p), 0);
  const metrics = {
    pages: pages.length,
    HEADER_OVERLAP: browser.reduce((a, b) => a + b.headerOverlap.length, 0),
    BROKEN_IMAGES: browser.reduce((a, b) => a + b.brokenImages.length, 0),
    UNRELATED_MEDIA: sum((p) => p.unrelatedMedia.length),
    HORIZONTAL_OVERFLOW: browser.filter((b) => b.overflow).length,
    DUPLICATE_SAME_PAGE_BLOCKS: sum((p) => [...p.duplicatedText, ...p.duplicatedHeadings, ...p.duplicatedMedia].filter((d) => d.classification === "ACCIDENTAL_SAME_PAGE_DUPLICATION").length),
    HERO_CTA_STACK: pages.filter((p) => p.cta.heroCtaStack).length,
    DUPLICATE_FAQ: sum((p) => p.faq.duplicates.length),
    STALE_FAQ_SCHEMA: sum((p) => p.faq.schemaNotVisible.length),
    ORPHAN_PAGE_FORMS: sum((p) => p.forms.orphan.length),
    H1_COUNT_INVALID: pages.filter((p) => p.h1Count !== 1).length,
    MALFORMED_TEL_LINKS: sum((p) => p.telLinks.malformed.length),
    FIXED_CONTROL_OVERLAP: browser.reduce((a, b) => a + b.fixedOverlap.length, 0),
    SMALL_MOBILE_HEADER_TAP_TARGETS: browser.reduce((a, b) => a + b.smallTapTargets.length, 0),
    MENU_CONTROLS_VISIBLE: browser.filter((b) => b.menuControlsHidden === false).length,
    TOC_MISMATCH: sum((p) => (p.toc ? p.toc.missingTargets.length + p.toc.textMismatch.length : 0)),
    HEADING_ORDER_WARNINGS: sum((p) => p.headingWarnings.length),
    SEO_TITLE_MISMATCH: pages.filter((p) => !p.seo.title!.match).length,
    SEO_DESCRIPTION_MISMATCH: pages.filter((p) => !p.seo.description!.match).length,
    SEO_CANONICAL_MISMATCH: pages.filter((p) => !p.seo.canonical!.match).length,
    SEO_ROBOTS_MISMATCH: pages.filter((p) => !p.seo.robots!.match).length,
    SEO_H1_MISMATCH: pages.filter((p) => !p.seo.h1!.match).length,
    DESIGN_SYSTEM_INJECTED_CROSS_PAGE: crossPage.filter((c) => (c as { classification: string }).classification === "DESIGN_SYSTEM_INJECTED").length,
  };

  fs.mkdirSync("audit/reports", { recursive: true });
  fs.writeFileSync(
    "audit/reports/PHASE_2B7_DUPLICATE_CONTENT_AUDIT.json",
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        local: LOCAL,
        method:
          "Rendered <main> text units (p/li/headings/dt/dd, ≥25 chars; headings ≥4) excluding shared chrome; a repeat is ACCIDENTAL when the local page shows it more times than the production page content does. Media keyed by file basename. Cross-page: units on ≥3 local pages, classified against production page text.",
        totals: {
          accidentalSamePage: metrics.DUPLICATE_SAME_PAGE_BLOCKS,
          sourceRepeatPreserved: sum((p) => [...p.duplicatedText, ...p.duplicatedHeadings, ...p.duplicatedMedia].filter((d) => d.classification === "SOURCE_REPEAT_PRESERVED").length),
          heroCtaStack: metrics.HERO_CTA_STACK,
          duplicateFaq: metrics.DUPLICATE_FAQ,
          crossPage: countBy(crossPage as { classification: string }[], (c) => c.classification),
        },
        pages: pages.map((p) => ({
          url: p.url,
          duplicatedText: p.duplicatedText,
          duplicatedHeadings: p.duplicatedHeadings,
          duplicatedMedia: p.duplicatedMedia,
          cta: p.cta,
          faq: { visible: p.faq.visible, duplicates: p.faq.duplicates },
          forms: p.forms,
          classification: [...p.duplicatedText, ...p.duplicatedHeadings, ...p.duplicatedMedia].some((d) => d.classification === "ACCIDENTAL_SAME_PAGE_DUPLICATION")
            ? "ACCIDENTAL_SAME_PAGE_DUPLICATION"
            : [...p.duplicatedText, ...p.duplicatedHeadings, ...p.duplicatedMedia].length
              ? "SOURCE_REPEAT_PRESERVED"
              : "UNIQUE",
          actionTaken: p.actionsTaken,
        })),
        crossPage,
      },
      null,
      2,
    ),
    "utf8",
  );
  fs.writeFileSync("audit/reports/PHASE_2B7_QA.json", JSON.stringify({ generated: new Date().toISOString(), local: LOCAL, metrics, pages, browser }, null, 2), "utf8");

  const lines = [
    JSON.stringify(metrics, null, 1),
    "--- accidental duplicates ---",
    ...pages.flatMap((p) => [...p.duplicatedText, ...p.duplicatedHeadings, ...p.duplicatedMedia].filter((d) => d.classification === "ACCIDENTAL_SAME_PAGE_DUPLICATION").map((d) => `${p.url} ${JSON.stringify(d)}`)),
    "--- hero cta stack ---",
    ...pages.filter((p) => p.cta.heroCtaStack).map((p) => `${p.url} ${JSON.stringify(p.cta)}`),
    "--- faq ---",
    ...pages.filter((p) => p.faq.duplicates.length || p.faq.schemaNotVisible.length || p.faq.visibleNotInSchema.length).map((p) => `${p.url} ${JSON.stringify(p.faq)}`),
    "--- orphan forms / h1 / tel / toc / unrelated ---",
    ...pages.filter((p) => p.forms.orphan.length).map((p) => `FORM ${p.url} ${p.forms.orphan.join(",")}`),
    ...pages.filter((p) => p.h1Count !== 1).map((p) => `H1 ${p.url} ${p.h1Count} ${p.h1.join(" | ")}`),
    ...pages.filter((p) => p.telLinks.malformed.length).map((p) => `TEL ${p.url} ${p.telLinks.malformed.join(",")}`),
    ...pages.filter((p) => p.toc && (p.toc.missingTargets.length || p.toc.textMismatch.length)).map((p) => `TOC ${p.url} ${JSON.stringify(p.toc)}`),
    ...pages.filter((p) => p.unrelatedMedia.length).map((p) => `MEDIA ${p.url} ${p.unrelatedMedia.join(",")}`),
    "--- heading warnings ---",
    ...pages.filter((p) => p.headingWarnings.length).map((p) => `${p.url} ${p.headingWarnings.join(" ; ")}`),
    "--- seo mismatches ---",
    ...pages.flatMap((p) => Object.entries(p.seo).filter(([, v]) => !v.match).map(([k, v]) => `${p.url} ${k}: local="${v.local}" prod="${v.production}"`)),
    "--- schema types differing ---",
    ...pages.filter((p) => p.schemaTypes.local.join() !== p.schemaTypes.production.join()).map((p) => `${p.url} local=${p.schemaTypes.local.join("/")} prod=${p.schemaTypes.production.join("/")}`),
    "--- browser ---",
    ...browser.filter((b) => b.overflow || b.brokenImages.length || b.headerOverlap.length || b.fixedOverlap.length || b.smallTapTargets.length || b.menuControlsHidden === false).map((b) => `${b.width} ${b.url} ${JSON.stringify({ o: b.overflow, img: b.brokenImages, hdr: b.headerOverlap, fab: b.fixedOverlap, tap: b.smallTapTargets, menu: b.menuControlsHidden })}`),
    "--- cross-page injected ---",
    ...(crossPage as { text: string; localPages: number; productionPages: number; classification: string }[]).filter((c) => c.classification !== "GLOBAL_BUSINESS_COPY").slice(0, 40).map((c) => `${c.classification} local=${c.localPages} prod=${c.productionPages} ${c.text}`),
  ];
  fs.writeFileSync("tmp/qa-2b7.txt", lines.join("\n"), "utf8");
  console.log("\n" + JSON.stringify(metrics));
}

function countBy<T>(arr: T[], f: (x: T) => string) {
  const m: Record<string, number> = {};
  for (const x of arr) m[f(x)] = (m[f(x)] ?? 0) + 1;
  return m;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
