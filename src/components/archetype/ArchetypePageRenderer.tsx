import { renderCompositionBlock } from "@/components/homepage-inspired/render-composition-block";
import { FinalConversionSection } from "@/components/sections/FinalConversionSection";
import { RichTextSection } from "@/components/sections/RichTextSection";
import { InternalHero } from "@/components/internal/InternalHero";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { stripHeroDuplicateImage } from "@/lib/content-sections";
import { wpUrlToLocal } from "@/lib/media";
import { parsePageComposition } from "@/lib/page-composition/parse-page-composition";
import type { PageArchetype } from "@/lib/structured-pages/page-archetypes";
import { htmlToPlainText } from "@/lib/wp-html";

const TONE_CYCLE = ["white", "muted", "white", "neutral"] as const;

export function ArchetypePageRenderer({
  record,
  archetype,
}: {
  record: ContentRecord;
  archetype: PageArchetype;
}) {
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

  const showFinalConversion = !["CONTACT", "FAQ", "PRICING_PAGE"].includes(archetype);

  const semanticTypes = composition.blocks.map((b) => b.type).join(",");
  const hasRemaining = composition.remainingContentBlocks.length > 0;

  return (
    <InternalPageShell
      debug={{
        archetype,
        renderer: "ArchetypePageRenderer",
        rawFallback: composition.rawFallbackUsed,
        structuredBlockCount: composition.blocks.length,
        semanticBlockTypes: semanticTypes,
        coverageRatio: composition.coverageRatio,
        hasRemainingFallback: hasRemaining,
      }}
    >
      <InternalHero
        title={record.title}
        breadcrumbs={breadcrumbs}
        intro={intro}
        image={heroImage}
        imageAlt={record.title}
        backgroundImage={record.heroBackgroundImage ? wpUrlToLocal(record.heroBackgroundImage) : null}
      />

      {introHtml && htmlToPlainText(introHtml).length > (intro?.length || 0) + 40 ? (
        <RichTextSection html={introHtml} tone="white" />
      ) : null}

      {composition.blocks.map((block, index) =>
        renderCompositionBlock(block, TONE_CYCLE[index % TONE_CYCLE.length]),
      )}

      {showFinalConversion ? <FinalConversionSection /> : null}
    </InternalPageShell>
  );
}

export function isCommercialArchetype(archetype: PageArchetype): boolean {
  return [
    "MOVING_SERVICE",
    "STORAGE_SERVICE",
    "PACKING_SERVICE",
    "AREA_PAGE",
    "SERVICE_LANDING",
    "PRICING_PAGE",
  ].includes(archetype);
}
