import { ContentHero } from "@/components/content-page/ContentHero";
import { FinalConversionSection } from "@/components/sections/FinalConversionSection";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import { AboutPageView } from "@/components/structured-content/views/AboutPageView";
import { CommercialPageView } from "@/components/structured-content/views/CommercialPageView";
import { ContactPageView } from "@/components/structured-content/views/ContactPageView";
import { FaqPageView } from "@/components/structured-content/views/FaqPageView";
import { QuotePageView } from "@/components/structured-content/views/QuotePageView";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { buildStructuredPageModel } from "@/lib/structured-content/build-page-model";
import { classifyPageArchetype } from "@/lib/structured-pages/page-archetypes";

/**
 * Phase 2B.6B — production HTML → structured model → homepage-inspired React sections.
 */
export function TrueReconstructionPageRenderer({ record }: { record: ContentRecord }) {
  const model = buildStructuredPageModel(record);
  const archetype = classifyPageArchetype(record.path, record.type);
  const breadcrumbs = breadcrumbsForContent(record);

  const sectionTypes = model.sections.map((s) => s.type).join(",");

  return (
    <InternalPageShell
      debug={{
        archetype,
        renderer: "TrueReconstructionPageRenderer",
        rawFallback: false,
        structuredBlockCount: model.sections.length,
        semanticBlockTypes: sectionTypes,
        designedSections: model.metrics.designedSections,
        proseSections: model.metrics.proseSections,
        rawHtmlBlocks: model.metrics.rawHtmlBlocks,
      }}
    >
      <ContentHero
        title={model.hero.title}
        breadcrumbs={breadcrumbs}
        intro={model.hero.intro}
        image={model.hero.image}
        imageAlt={model.hero.imageAlt}
        showQuoteCta={model.hero.showQuoteCta}
        variant={model.hero.variant}
      />

      {model.kind === "contact" ? (
        <ContactPageView model={model} />
      ) : model.kind === "faq" ? (
        <FaqPageView model={model} />
      ) : model.kind === "quote" ? (
        <QuotePageView model={model} />
      ) : model.kind === "about" ? (
        <AboutPageView model={model} />
      ) : (
        <CommercialPageView model={model} />
      )}

      {model.showFinalConversion ? <FinalConversionSection inspired /> : null}
    </InternalPageShell>
  );
}
