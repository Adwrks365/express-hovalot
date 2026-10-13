import * as cheerio from "cheerio";
import type { FeatureCard } from "@/lib/structured-pages/types";
import { extractFaqItems } from "@/lib/content-sections";
import { isGlobalCtaText, isGlobalFooterFormText } from "@/content/migration/global-template-filter";
import { wpUrlToLocal } from "@/lib/media";
import type { PageArchetype } from "@/lib/structured-pages/page-archetypes";
import {
  COVERAGE_THRESHOLD,
  computeCoverageRatio,
  normalizeVisibleText,
  textFromBlock,
} from "@/lib/page-composition/content-coverage";
import type {
  CompositionBlock,
  PageComposition,
  RemovedContentLog,
  RemainingContentBlock,
} from "@/lib/page-composition/types";
import { isAllowedPageMedia } from "@/content/migration/global-media-filter";
import { stripGlobalMediaSections } from "@/lib/page-composition/strip-global-media";
import { htmlToPlainText } from "@/lib/wp-html";

function slugify(text: string, index: number): string {
  return (
    text
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0590-\u05FF-]+/g, "")
      .slice(0, 60) || `block-${index}`
  );
}

function stripText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isFormOrGlobalWidget(html: string): boolean {
  if (/<form\b|wpcf7|elementor-field-group/i.test(html)) return true;
  const text = stripText(html);
  return isGlobalFooterFormText(text) || (isGlobalCtaText(text) && text.length < 200);
}

function isCtaSection(heading: string | null, html: string): boolean {
  const h = heading || "";
  const text = stripText(html);
  return (
    /רוצים לקבל הצעת מחיר|הצעת מחיר מהירה|חייגו עכשיו/i.test(h + text.slice(0, 180)) &&
    text.length < 400
  );
}

function isFaqSection(heading: string | null, html: string): boolean {
  return /שאלות\s*נפוצות|FAQ/i.test(heading || "") || extractFaqItems(html).length >= 2;
}

function extractAreaLinks(html: string): { href: string; label: string }[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const links: { href: string; label: string }[] = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = $(el).text().replace(/\s+/g, " ").trim();
    if (!label || label.length > 80) return;
    if (!/\/הובלות-ב|\/הובלת-/.test(href) && !href.includes("הובלות-ב")) return;
    const key = `${href}|${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ href, label });
  });
  return links;
}

function extractFeatureCards(html: string): FeatureCard[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const cards: FeatureCard[] = [];

  $("h3, h4").each((_, heading) => {
    const title = $(heading).text().replace(/\s+/g, " ").trim();
    if (!title || title.length > 120) return;
    let img: string | null = null;
    let imgAlt = title;
    // Only immediate siblings — never prevAll (cross-section media leakage)
    const nextImg = $(heading).nextAll("img").first();
    if (nextImg.length) {
      const src = nextImg.attr("src") || null;
      if (src && isAllowedPageMedia(src, nextImg.attr("width"), nextImg.attr("height"))) {
        img = src;
        imgAlt = nextImg.attr("alt") || title;
      }
    }
    const parts: string[] = [];
    let sib = $(heading).next();
    while (sib.length && !sib.is("h2, h3, h4")) {
      const chunk = $.html(sib);
      if (chunk && !sib.is("img")) parts.push(chunk);
      sib = sib.next();
    }
    const descriptionHtml = parts.join("").trim();
    if (descriptionHtml.length > 20 && descriptionHtml.length < 1200) {
      cards.push({
        image: img ? wpUrlToLocal(img) : null,
        imageAlt: imgAlt,
        title,
        descriptionHtml,
      });
    }
  });

  return cards;
}

function extractBenefitItems(html: string): { icon?: string | null; title: string; description: string }[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const items: { icon?: string | null; title: string; description: string }[] = [];

  $("h3, h4, li strong, li b").each((_, el) => {
    const $el = $(el);
    const title = $el.text().replace(/\s+/g, " ").trim().replace(/:$/, "");
    if (!title || title.length > 100) return;
    let description = "";
    if ($el.is("h3, h4")) {
      description = $el
        .nextUntil("h2, h3, h4")
        .text()
        .replace(/\s+/g, " ")
        .trim();
    } else {
      description = $el.parent().text().replace(title, "").replace(/\s+/g, " ").trim();
    }
    if (description.length < 15 || description.length > 500) return;
    const iconEl = $el.nextAll("img").first().length ? $el.nextAll("img").first() : $el.find("img").first();
    const iconSrc = iconEl.attr("src") || null;
    const icon =
      iconSrc && isAllowedPageMedia(iconSrc, iconEl.attr("width"), iconEl.attr("height"))
        ? iconSrc
        : null;
    items.push({
      icon: icon ? wpUrlToLocal(icon) : null,
      title,
      description,
    });
  });

  const unique = new Map(items.map((i) => [i.title, i]));
  return [...unique.values()];
}

function extractLogoGrid(html: string): { src: string; alt: string }[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const logos: { src: string; alt: string }[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    const alt = ($(el).attr("alt") || "").trim();
    const w = Number($(el).attr("width") || 0);
    if (w > 0 && w > 220) return;
    if (alt.length > 60) return;
    if (!isAllowedPageMedia(src, $(el).attr("width"), $(el).attr("height"))) return;
    logos.push({ src: wpUrlToLocal(src) || src, alt });
  });
  return logos;
}

function splitImageTextPairs(html: string, startIndex: number): CompositionBlock[] {
  const $ = cheerio.load(`<div id="root">${html}</div>`, {}, false);
  const root = $("#root");
  const blocks: CompositionBlock[] = [];
  let proseBuffer: string[] = [];
  let imageTextIndex = 0;

  const flushProse = () => {
    const body = proseBuffer.join("").trim();
    proseBuffer = [];
    if (!body || stripText(body).length < 30) return;
    blocks.push({
      type: "prose",
      id: slugify(`prose-${blocks.length}`, startIndex + blocks.length),
      html: body,
    });
  };

  root.contents().each((_, node) => {
    if (node.type !== "tag") return;
    const $node = $(node);
    if (node.tagName === "img" || (node.tagName === "figure" && $node.find("img").length)) {
      flushProse();
      const img = node.tagName === "img" ? $node : $node.find("img").first();
      const src = img.attr("src");
      if (!src || !isAllowedPageMedia(src, img.attr("width"), img.attr("height"))) {
        proseBuffer.push($.html(node) || "");
        return;
      }
      const textParts: string[] = [];
      let sib = $node.next();
      while (sib.length && !sib.is("h2, img, figure")) {
        if (!sib.is("img")) textParts.push($.html(sib) || "");
        sib = sib.next();
      }
      const textHtml = textParts.join("").trim();
      if (stripText(textHtml).length >= 40) {
        blocks.push({
          type: "imageText",
          id: slugify(`imgtext-${imageTextIndex}`, startIndex + imageTextIndex),
          image: wpUrlToLocal(src) || src,
          imageAlt: img.attr("alt") || "",
          html: textHtml,
          imagePosition: imageTextIndex % 2 === 0 ? "start" : "end",
        });
        imageTextIndex++;
        sib.prevAll().remove();
        $node.remove();
      } else {
        proseBuffer.push($.html(node) || "");
      }
      return;
    }
    proseBuffer.push($.html(node) || "");
  });
  flushProse();
  return blocks;
}

export function parseSectionBlocks(
  heading: string | null,
  html: string,
  index: number,
  archetype: PageArchetype,
): CompositionBlock[] {
  if (!html.trim() && !heading) return [];
  if (isFormOrGlobalWidget(html)) return [];

  if (archetype === "AREA_PAGE") {
    const areaLinks = extractAreaLinks(html);
    if (areaLinks.length >= 2) {
      return [
        {
          type: "areaLinks",
          id: slugify(heading || "areas", index),
          heading: heading || "הובלות באזורים נוספים",
          links: areaLinks,
        },
      ];
    }
    const areaBenefits = extractBenefitItems(html);
    if (areaBenefits.length >= 2) {
      return [
        {
          type: "benefitGrid",
          id: slugify(heading || "benefits", index),
          heading,
          items: areaBenefits.slice(0, 8),
        },
      ];
    }
  }

  if (isFaqSection(heading, html)) {
    const items = extractFaqItems(html);
    if (items.length >= 2) {
      const faqText = normalizeVisibleText(items.map((i) => `${i.question} ${i.answer}`).join(" "));
      const sectionText = normalizeVisibleText(stripText(html));
      if (sectionText.length > 0 && faqText.length / sectionText.length >= 0.55) {
        return [
          {
            type: "faq",
            id: slugify(heading || "faq", index),
            heading,
            introHtml: heading ? `<h2>${heading}</h2>` : null,
            items,
          },
        ];
      }
    }
  }

  if (isCtaSection(heading, html)) {
    return [{ type: "ctaTop", id: slugify(heading || "cta", index), heading }];
  }

  const areaLinks = extractAreaLinks(html);
  if (
    areaLinks.length >= 3 &&
    (archetype === "AREA_PAGE" || /אזור|עיר|שכונ|ירושלים|הובלות ב/i.test(heading || stripText(html).slice(0, 200)))
  ) {
    return [
      {
        type: "areaLinks",
        id: slugify(heading || "areas", index),
        heading: heading || "שירותי הובלה באזורים נוספים",
        links: areaLinks,
      },
    ];
  }

  const logos = extractLogoGrid(html);
  if (
    archetype !== "AREA_PAGE" &&
    logos.length >= 4 &&
    stripText(html).length < logos.length * 80
  ) {
    return [{ type: "logoGrid", id: slugify(heading || "logos", index), heading, logos }];
  }

  const cards = extractFeatureCards(html);
  if (cards.length >= 2 && archetype !== "AREA_PAGE") {
    const introParts: string[] = [];
    if (heading) introParts.push(`<h2>${heading}</h2>`);
    const $ = cheerio.load(`<div>${html}</div>`, {}, false);
    $("h2, h3, h4, img").remove();
    const rest = $.root().html()?.trim();
    if (rest && stripText(rest).length > 40) introParts.push(rest);
    return [
      {
        type: "featureGrid",
        id: slugify(heading || "features", index),
        heading: heading && cards.length >= 3 ? heading : null,
        introHtml: introParts.join("\n") || null,
        cards,
      },
    ];
  }

  const benefits = extractBenefitItems(html);
  const benefitHeading = heading || "";
  if (
    archetype !== "AREA_PAGE" &&
    benefits.length >= 3 &&
    (/למה לבחור|יתרונות|למה|מומח|ביטוח|מקצוע/i.test(benefitHeading + stripText(html).slice(0, 120)))
  ) {
    return [
      {
        type: "benefitGrid",
        id: slugify(benefitHeading || "benefits", index),
        heading,
        items: benefits.slice(0, 8),
      },
    ];
  }

  const imgs = cheerio.load(html)("img");
  if (imgs.length === 1 && stripText(html).length > 120) {
    const first = imgs.first();
    const src = first.attr("src");
    if (src && isAllowedPageMedia(src, first.attr("width"), first.attr("height"))) {
      const $ = cheerio.load(`<div>${html}</div>`, {}, false);
      imgs.remove();
      const rest = $.root().html()?.trim() || "";
      if (stripText(rest).length >= 40) {
        return [
          {
            type: "imageText",
            id: slugify(heading || "imgtext", index),
            image: wpUrlToLocal(src) || src,
            imageAlt: first.attr("alt") || heading || "",
            html: heading ? `<h2>${heading}</h2>\n${rest}` : rest,
            imagePosition: index % 2 === 0 ? "start" : "end",
          },
        ];
      }
    }
  }

  if (imgs.length >= 2) {
    const pairs = splitImageTextPairs(
      heading ? `<h2>${heading}</h2>\n${html}` : html,
      index,
    );
    if (pairs.some((p) => p.type === "imageText")) return pairs;
  }

  const body = heading && !html.includes("<h2") ? `<h2>${heading}</h2>\n${html}` : html;
  if (stripText(body).length < 20) return [];
  return [{ type: "prose", id: slugify(heading || "prose", index), heading, html: body }];
}

type RawSection = { heading: string | null; html: string };

function fingerprintSection(section: RawSection): string {
  return normalizeVisibleText(stripText((section.heading || "") + section.html)).slice(0, 120);
}

/**
 * Split sanitized HTML into intro + H2 sections.
 * Recurses into wrapper divs so nested Elementor H2 headings are found.
 */
function splitByH2Sections(html: string): { introHtml: string | null; sections: RawSection[] } {
  const $ = cheerio.load(`<div id="pc-root">${html}</div>`, {}, false);
  const root = $("#pc-root");

  const beforeH2: string[] = [];
  const sections: RawSection[] = [];
  let currentHeading: string | null = null;
  let currentNodes: string[] = [];

  const flushSection = () => {
    const body = currentNodes.join("").trim();
    if (body || currentHeading) sections.push({ heading: currentHeading, html: body });
    currentHeading = null;
    currentNodes = [];
  };

  const walk = (container: ReturnType<typeof $>) => {
    container.contents().each((_, node) => {
      if (node.type === "tag" && node.tagName === "h2") {
        flushSection();
        currentHeading = $(node).text().replace(/\s+/g, " ").trim();
        return;
      }
      if (node.type === "tag") {
        const $node = $(node);
        if ($node.find("h2").length > 0) {
          walk($node);
          return;
        }
      }
      const chunk =
        node.type === "tag"
          ? $.html(node) || ""
          : node.type === "text"
            ? node.data || ""
            : "";
      if (!chunk.trim()) return;
      if (currentHeading !== null || sections.length > 0 || beforeH2.length > 0) {
        currentNodes.push(chunk);
      } else {
        beforeH2.push(chunk);
      }
    });
  };

  walk(root);
  flushSection();

  if (sections.length === 0 && !beforeH2.length) {
    const body = root.html()?.trim() || "";
    if (body) return { introHtml: null, sections: [{ heading: null, html: body }] };
  }

  return { introHtml: beforeH2.join("").trim() || null, sections };
}

function sectionProseHtml(section: RawSection): string {
  if (section.heading && !section.html.includes("<h2")) {
    return `<h2>${section.heading}</h2>\n${section.html}`;
  }
  if (section.heading && !section.html.trim()) {
    return `<h2>${section.heading}</h2>`;
  }
  return section.html;
}

function proseBlockFromSection(section: RawSection, index: number): CompositionBlock {
  return {
    type: "prose",
    id: slugify(section.heading || "prose", index),
    heading: section.heading,
    html: sectionProseHtml(section),
  };
}

function sectionWordCoverage(section: RawSection, coveredText: string): number {
  const sectionWords = [
    ...new Set(normalizeVisibleText(stripText(section.html)).split(" ").filter((w) => w.length > 2)),
  ];
  if (!sectionWords.length) return 1;
  const coveredTokens = new Set(normalizeVisibleText(coveredText).split(" "));
  let matched = 0;
  for (const word of sectionWords) {
    if (coveredTokens.has(word)) matched++;
  }
  return matched / sectionWords.length;
}

function collectUnderrepresentedSections(
  sections: RawSection[],
  introHtml: string | null,
  blocks: CompositionBlock[],
  excludedFingerprints: Set<string>,
  minSectionCoverage = 0.7,
): RemainingContentBlock[] {
  const coveredText = htmlToPlainText(introHtml || "") + blocks.map(textFromBlock).join(" ");
  const out: RemainingContentBlock[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]!;
    const fp = fingerprintSection(section);
    if (excludedFingerprints.has(fp)) continue;
    if (stripText(section.html).length < 25 && !section.heading) continue;
    if (sectionWordCoverage(section, coveredText) >= minSectionCoverage) continue;
    out.push({
      id: slugify(`remaining-${section.heading || "section"}`, i),
      html: sectionProseHtml(section),
      orderIndex: i + 0.5,
    });
  }
  return out;
}

/** Parse sanitized HTML into semantic page composition blocks */
export function parsePageComposition(
  html: string,
  archetype: PageArchetype,
): PageComposition {
  const empty: PageComposition = {
    introHtml: null,
    blocks: [],
    remainingContentBlocks: [],
    coverageRatio: 1,
    rawFallbackUsed: true,
    removedDuplicates: [],
  };

  if (!html?.trim()) return empty;

  const cleanedHtml = stripGlobalMediaSections(html);
  const { introHtml, sections } = splitByH2Sections(cleanedHtml);
  const blocks: CompositionBlock[] = [];
  const removedDuplicates: RemovedContentLog[] = [];
  const excludedFingerprints = new Set<string>();
  const assignedFingerprints = new Set<string>();
  let topCtaUsed = false;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]!;
    const fp = fingerprintSection(section);

    if (isFormOrGlobalWidget(section.html)) {
      excludedFingerprints.add(fp);
      removedDuplicates.push({
        sectionIndex: i,
        fingerprint: fp,
        reason: "global-form-or-widget",
      });
      continue;
    }

    if (isCtaSection(section.heading, section.html)) {
      excludedFingerprints.add(fp);
      if (!topCtaUsed) {
        blocks.push({
          type: "ctaTop",
          id: slugify(section.heading || "cta-top", i),
          heading: section.heading,
        });
        topCtaUsed = true;
      } else {
        removedDuplicates.push({
          sectionIndex: i,
          fingerprint: fp,
          reason: "duplicate-global-cta",
        });
      }
      continue;
    }

    let parsed = parseSectionBlocks(section.heading, section.html, i, archetype);

    if (!parsed.length && stripText(section.html).length >= 20) {
      parsed = [proseBlockFromSection(section, i)];
    }

    if (parsed.length) assignedFingerprints.add(fp);
    blocks.push(...parsed);
  }

  let merged =
    archetype === "AREA_PAGE" ? blocks : mergeServiceSectionRuns(blocks, archetype);
  const remainingContentBlocks: RemainingContentBlock[] = [];
  const effectiveSourceHtml = [
    introHtml || "",
    ...sections
      .filter((s) => !excludedFingerprints.has(fingerprintSection(s)))
      .map((s) => `${s.heading || ""} ${s.html}`),
  ].join("\n");
  let coverageRatio = computeCoverageRatio(effectiveSourceHtml, introHtml, merged);

  if (coverageRatio < COVERAGE_THRESHOLD) {
    let minSectionCoverage = 0.85;
    let gapBlocks = collectUnderrepresentedSections(
      sections,
      introHtml,
      merged,
      excludedFingerprints,
      minSectionCoverage,
    );
    while (!gapBlocks.length && minSectionCoverage > 0.5 && coverageRatio < COVERAGE_THRESHOLD) {
      minSectionCoverage -= 0.1;
      gapBlocks = collectUnderrepresentedSections(
        sections,
        introHtml,
        merged,
        excludedFingerprints,
        minSectionCoverage,
      );
    }
    for (const gap of gapBlocks) {
      remainingContentBlocks.push(gap);
      merged = [
        ...merged,
        { type: "remaining", id: gap.id, html: gap.html, orderIndex: gap.orderIndex },
      ];
    }
    coverageRatio = computeCoverageRatio(effectiveSourceHtml, introHtml, merged);
  }

  const rawFallbackUsed =
    merged.length === 0 ||
    merged.every((b) => b.type === "prose" || b.type === "remaining") ||
    coverageRatio < COVERAGE_THRESHOLD;

  return {
    introHtml,
    blocks: merged,
    remainingContentBlocks,
    coverageRatio,
    rawFallbackUsed,
    removedDuplicates,
  };
}

function extractFirstImageFromHtml(html: string): string | null {
  const $ = cheerio.load(html, {}, false);
  const src = $("img").first().attr("src");
  return src ? wpUrlToLocal(src) || src : null;
}

function isServiceSectionProse(block: CompositionBlock): boolean {
  if (block.type !== "prose" || !block.heading) return false;
  const text = stripText(block.html);
  if (/שאלות\s*נפוצות|הצעת מחיר|חייגו/i.test(block.heading)) return false;
  return block.heading.length <= 90 && text.length >= 25 && text.length <= 900;
}

/** Merge consecutive short H2 prose sections into feature grid (service pages only). */
function mergeServiceSectionRuns(
  blocks: CompositionBlock[],
  archetype: PageArchetype,
): CompositionBlock[] {
  if (archetype === "AREA_PAGE") return blocks;
  const out: CompositionBlock[] = [];
  let run: CompositionBlock[] = [];

  const flush = () => {
    if (run.length >= 2) {
      out.push({
        type: "featureGrid",
        id: `service-run-${run[0]!.id}`,
        heading: null,
        introHtml: null,
        cards: run.map((r) => {
          const img = r.type === "prose" ? extractFirstImageFromHtml(r.html) : null;
          return {
            title: r.type === "prose" ? r.heading || "" : "",
            descriptionHtml:
              r.type === "prose" ? r.html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, "") : "",
            image: img && isAllowedPageMedia(img) ? img : null,
            imageAlt: r.type === "prose" ? r.heading || "" : "",
          };
        }),
      });
    } else {
      out.push(...run);
    }
    run = [];
  };

  for (const block of blocks) {
    if (isServiceSectionProse(block)) {
      run.push(block);
    } else {
      flush();
      out.push(block);
    }
  }
  flush();
  return out;
}
