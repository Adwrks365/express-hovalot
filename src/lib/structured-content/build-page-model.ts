import * as cheerio from "cheerio";
import type { ContentRecord } from "@/lib/content-registry";
import type { CompositionBlock } from "@/lib/page-composition/types";
import { parsePageComposition, parseSectionBlocks } from "@/lib/page-composition/parse-page-composition";
import { stripGlobalMediaSections } from "@/lib/page-composition/strip-global-media";
import { splitSourceSections } from "@/lib/page-composition/split-source-sections";
import {
  extractLinksFromHtml,
  extractProseContent,
  featureCardDescriptionToPlain,
  introProseFromHtml,
} from "@/lib/structured-content/extract-prose";
import { extractStatsItems, looksLikeStatsSection } from "@/lib/structured-content/extract-stats";
import type {
  StructuredPageKind,
  StructuredPageModel,
  StructuredPageSection,
} from "@/lib/structured-content/types";
import { extractFaqItems, stripHeroDuplicateImage } from "@/lib/content-sections";
import { classifyPageArchetype, type PageArchetype } from "@/lib/structured-pages/page-archetypes";
import { wpUrlToLocal } from "@/lib/media";
import { htmlToPlainText } from "@/lib/wp-html";

function kindFromArchetype(archetype: PageArchetype): StructuredPageKind {
  switch (archetype) {
    case "CONTACT":
      return "contact";
    case "FAQ":
      return "faq";
    case "ABOUT":
      return "about";
    case "PRICING_PAGE":
      return "quote";
    case "ARTICLE":
      return "article";
    default:
      return "commercial";
  }
}

function blockToSections(block: CompositionBlock): StructuredPageSection[] {
  switch (block.type) {
    case "ctaTop":
      return [];
    case "prose": {
      if (looksLikeStatsSection(block.heading ?? null, block.html)) {
        const stats = extractStatsItems(block.html);
        if (stats.length >= 2) {
          return [{ type: "stats", id: block.id, heading: block.heading ?? null, items: stats }];
        }
      }
      const body = extractProseContent(block.html, { stripHeading: block.heading });
      const links = extractLinksFromHtml(block.html);
      return [
        {
          type: "prose",
          id: block.id,
          heading: block.heading ?? null,
          body,
          links,
        },
      ];
    }
    case "imageText": {
      const $ = cheerio.load(`<div>${block.html}</div>`, {}, false);
      let heading: string | null = null;
      const h2 = $("h2").first();
      if (h2.length) {
        heading = h2.text().replace(/\s+/g, " ").trim();
        h2.remove();
      }
      const cleaned = $.root().html() || block.html;
      const body = extractProseContent(cleaned);
      const links = extractLinksFromHtml(block.html);
      return [
        {
          type: "imageText",
          id: block.id,
          heading: heading || block.imageAlt || null,
          image: block.image,
          imageAlt: block.imageAlt,
          imagePosition: block.imagePosition,
          body,
          links,
        },
      ];
    }
    case "benefitGrid":
      return [
        {
          type: "benefitGrid",
          id: block.id,
          heading: block.heading ?? null,
          items: block.items,
        },
      ];
    case "featureGrid":
      return [
        {
          type: "serviceCards",
          id: block.id,
          heading: block.heading ?? null,
          intro: block.introHtml ? introProseFromHtml(block.introHtml) : null,
          cards: block.cards.map((c) => ({
            title: c.title,
            description: featureCardDescriptionToPlain(c.descriptionHtml),
            image: c.image ? wpUrlToLocal(c.image) || c.image : null,
            imageAlt: c.imageAlt || c.title,
            href: null,
          })),
        },
      ];
    case "faq":
      return [
        {
          type: "faq",
          id: block.id,
          heading: block.heading ?? null,
          intro: block.introHtml ? introProseFromHtml(block.introHtml) : null,
          items: block.items,
        },
      ];
    case "areaLinks":
      return [
        {
          type: "areaLinks",
          id: block.id,
          heading: block.heading,
          links: block.links,
        },
      ];
    case "logoGrid":
      return [
        {
          type: "logoGrid",
          id: block.id,
          heading: block.heading ?? null,
          logos: block.logos,
        },
      ];
    case "remaining":
      return [
        {
          type: "prose",
          id: block.id,
          heading: null,
          body: extractProseContent(block.html),
          links: extractLinksFromHtml(block.html),
        },
      ];
    default:
      return [];
  }
}

function computeMetrics(sections: StructuredPageSection[]) {
  let designedSections = 0;
  let proseSections = 0;
  let rawHtmlBlocks = 0;

  for (const s of sections) {
    if (s.type === "prose") {
      proseSections++;
      if (s.body.tableHtml) rawHtmlBlocks++;
    } else {
      designedSections++;
    }
  }

  return { designedSections, proseSections, rawHtmlBlocks };
}

export function buildStructuredPageModel(record: ContentRecord): StructuredPageModel {
  const archetype = classifyPageArchetype(record.path, record.type);
  const kind = kindFromArchetype(archetype);
  const composition = parsePageComposition(record.sanitizedHtml, archetype);

  const heroImageRaw = record.heroSideImage || record.featuredImage;
  const heroImage = heroImageRaw ? wpUrlToLocal(heroImageRaw) : null;

  const introFromBody = composition.introHtml ? htmlToPlainText(composition.introHtml).slice(0, 320) : null;
  const introPlain =
    introFromBody ||
    (record.excerptHtml ? htmlToPlainText(record.excerptHtml).slice(0, 280) : null);

  const introHtml =
    composition.introHtml && stripHeroDuplicateImage(composition.introHtml, heroImage);
  let intro: ReturnType<typeof introProseFromHtml> =
    introHtml && htmlToPlainText(introHtml).length > (introPlain?.length || 0) + 40
      ? introProseFromHtml(introHtml)
      : null;

  const sections: StructuredPageSection[] = [];
  const blocksToConvert =
    archetype === "AREA_PAGE" && composition.blocks.every((b) => b.type === "prose" || b.type === "remaining")
      ? (() => {
          const cleaned = stripGlobalMediaSections(record.sanitizedHtml);
          const { sections: rawSections } = splitSourceSections(cleaned);
          const rebuilt: CompositionBlock[] = [];
          for (let i = 0; i < rawSections.length; i++) {
            const raw = rawSections[i]!;
            rebuilt.push(...parseSectionBlocks(raw.heading, raw.html, i, archetype));
          }
          return rebuilt.length ? rebuilt : composition.blocks;
        })()
      : composition.blocks;

  for (const block of blocksToConvert) {
    if (block.type === "ctaTop") continue;
    sections.push(...blockToSections(block));
  }

  if (!intro && (kind === "contact" || kind === "quote")) {
    const cleaned = stripGlobalMediaSections(record.sanitizedHtml);
    const fallbackIntro = introProseFromHtml(cleaned);
    if (fallbackIntro) {
      intro = fallbackIntro;
    }
  }

  if (kind === "faq") {
    const faqItems = extractFaqItems(stripGlobalMediaSections(record.sanitizedHtml));
    if (faqItems.length >= 2) {
      const nonFaq = sections.filter((s) => s.type !== "faq" && s.type !== "prose");
      sections.length = 0;
      sections.push(...nonFaq);
      sections.push({
        type: "faq",
        id: "faq-main",
        heading: record.title,
        intro: intro,
        items: faqItems,
      });
      intro = null;
    }
  }

  if (sections.length === 0 && kind === "quote") {
    const body = introProseFromHtml(stripGlobalMediaSections(record.sanitizedHtml));
    if (body) {
      sections.push({
        type: "prose",
        id: "quote-body",
        heading: null,
        body,
        links: extractLinksFromHtml(record.sanitizedHtml),
      });
    }
  }

  const showFinalConversion = !["CONTACT", "FAQ", "PRICING_PAGE"].includes(archetype);
  const showQuoteCta = !["CONTACT", "FAQ", "PRICING_PAGE"].includes(archetype);
  const heroVariant =
    archetype === "ABOUT" || archetype === "FAQ" || archetype === "CONTACT" ? "standard" : "service";

  const metrics = computeMetrics(sections);

  return {
    kind,
    hero: {
      title: record.title,
      intro: introPlain,
      image: heroImage,
      imageAlt: record.title,
      showQuoteCta,
      variant: heroVariant,
    },
    intro,
    sections,
    showFinalConversion,
    metrics,
  };
}
