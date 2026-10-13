import { ContentHero } from "@/components/content-page/ContentHero";
import { IntroSection } from "@/components/content-page/IntroSection";
import { renderCompositionBlock } from "@/components/homepage-inspired/render-composition-block";
import { FinalConversionSection } from "@/components/sections/FinalConversionSection";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { stripHeroDuplicateImage } from "@/lib/content-sections";
import { wpUrlToLocal } from "@/lib/media";
import { parsePageComposition } from "@/lib/page-composition/parse-page-composition";
import { classifyPageArchetype } from "@/lib/structured-pages/page-archetypes";
import { htmlToPlainText } from "@/lib/wp-html";

/** Alternating rhythm aligned with homepage section flow */
const TONE_CYCLE = ["white", "muted", "white", "neutral", "muted", "white"] as const;

/**
 * Phase 2B.6 — production content via composition blocks, homepage visual language.
 */
export function HomepageInspiredPageRenderer({ record }: { record: ContentRecord }) {
  const archetype = classifyPageArchetype(record.path, record.type);
  const breadcrumbs = breadcrumbsForContent(record);
  const heroImageRaw = record.heroSideImage || record.featuredImage;
  const heroImage = heroImageRaw ? wpUrlToLocal(heroImageRaw) : null;

  const composition = parsePageComposition(record.sanitizedHtml, archetype);
  const introFromBody = composition.introHtml ? htmlToPlainText(composition.introHtml).slice(0, 320) : null;
  const intro =
    introFromBody ||
    (record.excerptHtml ? htmlToPlainText(record.excerptHtml).slice(0, 280) : null);

  const introHtml =
    composition.introHtml && stripHeroDuplicateImage(composition.introHtml, heroImage);

  const showFinalConversion = !["CONTACT", "FAQ"].includes(archetype);
  const heroVariant =
    archetype === "ABOUT" || archetype === "FAQ" || archetype === "CONTACT" ? "standard" : "service";
  const showQuoteCta = !["CONTACT", "FAQ", "PRICING_PAGE"].includes(archetype);

  const semanticTypes = composition.blocks.map((b) => b.type).join(",");

  return (
    <InternalPageShell
      debug={{
        archetype,
        renderer: "HomepageInspiredPageRenderer",
        rawFallback: composition.rawFallbackUsed,
        structuredBlockCount: composition.blocks.length,
        semanticBlockTypes: semanticTypes,
        coverageRatio: composition.coverageRatio,
        hasRemainingFallback: composition.remainingContentBlocks.length > 0,
      }}
    >
      <ContentHero
        title={record.title}
        breadcrumbs={breadcrumbs}
        intro={intro}
        image={heroImage}
        imageAlt={record.title}
        showQuoteCta={showQuoteCta}
        variant={heroVariant}
      />

      {introHtml && htmlToPlainText(introHtml).length > (intro?.length || 0) + 40 ? (
        <IntroSection html={introHtml} tone="white" />
      ) : null}

      {composition.blocks.map((block, index) =>
        renderCompositionBlock(block, TONE_CYCLE[index % TONE_CYCLE.length], { animate: true }),
      )}

      {showFinalConversion ? <FinalConversionSection inspired /> : null}
    </InternalPageShell>
  );
}
