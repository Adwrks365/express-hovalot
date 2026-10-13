import { AboutPageHero } from "@/components/internal/AboutPageHero";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import { InternalHero } from "@/components/internal/InternalHero";
import { ConversionSection } from "@/components/sections/ConversionSection";
import { FinalConversionSection } from "@/components/sections/FinalConversionSection";
import { CtaStripSection } from "@/components/sections/CtaStripSection";
import { FaqSectionBlock } from "@/components/sections/FaqSectionBlock";
import { FeatureGridSection } from "@/components/sections/FeatureGridSection";
import { FormBlockSection } from "@/components/sections/FormBlockSection";
import { IconFeatureGridSection } from "@/components/sections/IconFeatureGridSection";
import { ImageTextSection } from "@/components/sections/ImageTextSection";
import { LogoGridSection } from "@/components/sections/LogoGridSection";
import { RichTextSection } from "@/components/sections/RichTextSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { StorageSolutionsGrid } from "@/components/sections/StorageSolutionsGrid";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { wpUrlToLocal } from "@/lib/media";
import { deduplicateStructuredBlocks } from "@/lib/structured-pages/deduplicate-blocks";
import { filterHeroDuplicateMedia } from "@/lib/structured-pages/filter-hero-media";
import { normalizeStructuredMedia } from "@/lib/structured-pages/normalize-media";
import type { StructuredBlock, StructuredPageData } from "@/lib/structured-pages/types";

function sectionTone(index: number, block: StructuredBlock): "white" | "muted" | "neutral" | "brand" {
  if (block.type === "stats") return "brand";
  if (block.type === "conversionSection" || block.type === "ctaStrip") return "muted";
  const cycle: ("white" | "muted" | "neutral")[] = ["white", "muted", "white", "neutral"];
  return cycle[index % cycle.length];
}

function renderBlock(block: StructuredBlock, index: number, pagePath: string) {
  const tone = sectionTone(index, block);

  switch (block.type) {
    case "richText":
      return <RichTextSection key={block.id} html={block.html} tone={tone} />;
    case "featureGrid":
      return (
        <FeatureGridSection
          key={block.id}
          title={block.title}
          introHtml={block.introHtml}
          cards={block.cards}
          tone={tone}
        />
      );
    case "storageSolutionsGrid":
      return (
        <StorageSolutionsGrid
          key={block.id}
          title={block.title}
          introHtml={block.introHtml}
          cards={block.cards}
          tone={tone}
        />
      );
    case "iconFeatureGrid":
      return <IconFeatureGridSection key={block.id} title={block.title} items={block.items} tone={tone} />;
    case "imageText":
      return (
        <ImageTextSection
          key={block.id}
          image={block.image}
          imageAlt={block.imageAlt}
          html={block.html}
          imagePosition={block.imagePosition}
          tone={tone}
        />
      );
    case "faq":
      return (
        <FaqSectionBlock
          key={block.id}
          introHtml={block.introHtml}
          items={block.items}
          showHeading={false}
          tone={tone}
        />
      );
    case "formBlock":
      if (pagePath === "/צרו-קשר") {
        return (
          <FormBlockSection
            key={block.id}
            title={block.title}
            bodyHtml={block.bodyHtml}
            variant="contact"
            tone={tone}
          />
        );
      }
      return null;
    case "conversionSection":
      if (pagePath === "/שאלות-נפוצות" || pagePath === "/צרו-קשר" || pagePath === "/about-us") {
        return (
          <ConversionSection
            key={block.id}
            introHtml={block.introHtml}
            formVariant={block.formVariant}
            formTitle={block.formTitle}
            showForm={block.showForm}
            tone={tone}
          />
        );
      }
      return null;
    case "ctaStrip":
      return <CtaStripSection key={block.id} buttons={block.buttons} tone={index % 2 ? "brand" : "muted"} />;
    case "stats":
      return <StatsSection key={block.id} items={block.items} tone="brand" />;
    case "logoGrid":
      return (
        <LogoGridSection
          key={block.id}
          title={block.title}
          logos={block.logos}
          tone={tone}
          useMarquee={pagePath === "/הצעת-מחיר"}
        />
      );
    default:
      return null;
  }
}

export function StructuredPageRenderer({
  record,
  structured,
}: {
  record: ContentRecord;
  structured: StructuredPageData;
  showBottomCta?: boolean;
}) {
  const heroImageRaw =
    structured.hero.image || record.heroSideImage || record.featuredImage || record.heroBackgroundImage;
  const heroImage = heroImageRaw ? wpUrlToLocal(heroImageRaw) : null;

  const prepared = filterHeroDuplicateMedia(
    deduplicateStructuredBlocks(normalizeStructuredMedia(structured).blocks, structured.path),
    heroImage,
  );
  const breadcrumbs = breadcrumbsForContent(record);
  const intro = structured.hero.intro || null;
  const heroVariant =
    structured.hero.variant ??
    (record.path === "/about-us" || record.path === "/שאלות-נפוצות" || record.path === "/צרו-קשר"
      ? "standard"
      : "service");

  const blockTypes = prepared.map((b) => b.type).join(",");

  return (
    <InternalPageShell
      debug={{
        archetype: structured.path === "/about-us" ? "ABOUT" : "STRUCTURED_REFERENCE",
        renderer: "StructuredPageRenderer",
        rawFallback: false,
        structuredBlockCount: prepared.length,
        semanticBlockTypes: blockTypes,
      }}
    >
      {heroVariant === "about" && structured.hero.headline && structured.hero.subtitle ? (
        <AboutPageHero
          title={record.title}
          breadcrumbs={breadcrumbs}
          headline={structured.hero.headline}
          subtitle={structured.hero.subtitle}
          intro={intro ?? ""}
        />
      ) : (
        <InternalHero
          title={record.title}
          breadcrumbs={breadcrumbs}
          intro={intro}
          image={heroImage}
          imageAlt={record.title}
          backgroundImage={record.heroBackgroundImage ? wpUrlToLocal(record.heroBackgroundImage) : null}
          variant={heroVariant === "about" ? "standard" : heroVariant}
        />
      )}
      {prepared.map((block, index) => renderBlock(block, index, record.path))}
      {!["/צרו-קשר", "/שאלות-נפוצות", "/הצעת-מחיר", "/about-us"].includes(record.path) ? (
        <FinalConversionSection />
      ) : null}
    </InternalPageShell>
  );
}
