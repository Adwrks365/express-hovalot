import { FaqSectionBlock } from "@/components/sections/FaqSectionBlock";
import { FinalConversionSection } from "@/components/sections/FinalConversionSection";
import { RichTextSection } from "@/components/sections/RichTextSection";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import { InternalHero } from "@/components/internal/InternalHero";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import {
  deduplicateContentSections,
  parseContentSections,
  stripHeroDuplicateImage,
} from "@/lib/content-sections";
import { wpUrlToLocal } from "@/lib/media";
import { htmlToPlainText } from "@/lib/wp-html";

const TONE_CYCLE = ["white", "muted", "white", "neutral"] as const;

/**
 * Archetype-driven layout for non-curated pages — Phase 2B.4
 * Preserves full production HTML content; improves section rhythm and design system.
 */
export function StructuredPageLayout({
  record,
  showBottomCta = true,
}: {
  record: ContentRecord;
  showBottomCta?: boolean;
}) {
  const breadcrumbs = breadcrumbsForContent(record);
  const heroImage = record.heroSideImage || record.featuredImage;
  const heroImageLocal = heroImage ? wpUrlToLocal(heroImage) : null;
  const heroBackground = record.heroBackgroundImage;

  const rawSections = parseContentSections(record.sanitizedHtml);
  const sections = deduplicateContentSections(rawSections, record.path);

  const introSection = sections.find((s) => s.kind === "intro");
  const introFromBody = introSection ? htmlToPlainText(introSection.html).slice(0, 320) : null;
  const intro =
    introFromBody ||
    (record.excerptHtml ? htmlToPlainText(record.excerptHtml).slice(0, 280) : null);

  const bodySections = sections.filter((s) => s.kind !== "intro");
  const hasBodyCta = bodySections.some((s) => s.kind === "cta");

  return (
    <InternalPageShell
      debug={{
        archetype: record.template,
        renderer: "WordPressContent",
        rawFallback: true,
        structuredBlockCount: bodySections.length,
        semanticBlockTypes: bodySections.map((s) => s.kind).join(","),
      }}
    >
      <InternalHero
        title={record.title}
        breadcrumbs={breadcrumbs}
        intro={intro}
        image={heroImageLocal}
        imageAlt={record.title}
        backgroundImage={heroBackground}
      />

      {introSection && introSection.html.replace(/<[^>]+>/g, "").trim().length > (intro?.length || 0) + 40 ? (
        <RichTextSection
          html={stripHeroDuplicateImage(introSection.html, heroImageLocal)}
          tone="white"
        />
      ) : null}

      {bodySections.map((section, index) => {
        const tone = TONE_CYCLE[index % TONE_CYCLE.length];
        const html = stripHeroDuplicateImage(section.html, heroImageLocal);

        if (section.kind === "faq" && section.faqItems?.length) {
          return (
            <FaqSectionBlock
              key={section.id}
              introHtml={section.heading ? `<h2>${section.heading}</h2>${html}` : html}
              items={section.faqItems}
              showHeading={false}
              tone={tone}
            />
          );
        }

        if (section.kind === "cta") {
          return (
            <section key={section.id} className="bg-brand-50/45 py-12 sm:py-16 lg:py-20">
              <div className="mx-auto max-w-3xl px-4 sm:px-6">
                {section.heading ? (
                  <SectionHeading title={section.heading} align="center" className="mb-6" />
                ) : null}
                <InternalCTA showQuote={record.template !== "quote"} />
              </div>
            </section>
          );
        }

        return (
          <RichTextSection
            key={section.id}
            html={
              section.heading && !html.includes("<h2")
                ? `<h2>${section.heading}</h2>\n${html}`
                : html
            }
            tone={tone}
          />
        );
      })}

      {showBottomCta && !hasBodyCta && record.template !== "quote" && record.template !== "contact" ? (
        <FinalConversionSection />
      ) : null}
    </InternalPageShell>
  );
}
