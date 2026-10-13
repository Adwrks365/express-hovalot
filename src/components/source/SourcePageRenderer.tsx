import { FinalConversionSection } from "@/components/sections/FinalConversionSection";
import { RichTextSection } from "@/components/sections/RichTextSection";
import { InternalHero } from "@/components/internal/InternalHero";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { stripHeroDuplicateImage } from "@/lib/content-sections";
import { isGlobalCtaText, isGlobalFooterFormText } from "@/content/migration/global-template-filter";
import { wpUrlToLocal } from "@/lib/media";
import {
  sectionToHtml,
  splitSourceSections,
} from "@/lib/page-composition/split-source-sections";
import { htmlToPlainText } from "@/lib/wp-html";

const TONE_CYCLE = ["white", "muted", "white", "neutral"] as const;

function stripText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isGlobalOnlySection(html: string): boolean {
  if (/<form\b|wpcf7|elementor-field-group/i.test(html)) return true;
  const text = stripText(html);
  return isGlobalFooterFormText(text) || (isGlobalCtaText(text) && text.length < 200);
}

/** Phase 2B.5 — faithful production HTML in source order (no semantic inference). */
export function SourcePageRenderer({ record }: { record: ContentRecord }) {
  const breadcrumbs = breadcrumbsForContent(record);
  const heroImageRaw = record.heroSideImage || record.featuredImage;
  const heroImage = heroImageRaw ? wpUrlToLocal(heroImageRaw) : null;

  const { introHtml, sections } = splitSourceSections(record.sanitizedHtml);
  const introFromBody = introHtml ? htmlToPlainText(introHtml).slice(0, 320) : null;
  const intro =
    introFromBody ||
    (record.excerptHtml ? htmlToPlainText(record.excerptHtml).slice(0, 280) : null);

  const displayIntroHtml =
    introHtml && stripHeroDuplicateImage(introHtml, heroImage);

  const skipFinalConversion = ["/צרו-קשר", "/שאלות-נפוצות", "/contact-us"].includes(record.path);

  const renderedSections = sections.filter((s) => !isGlobalOnlySection(s.html));

  return (
    <InternalPageShell
      debug={{
        archetype: "SOURCE_FIDELITY",
        renderer: "SourcePageRenderer",
        rawFallback: false,
        structuredBlockCount: renderedSections.length + (displayIntroHtml ? 1 : 0),
        semanticBlockTypes: renderedSections.map(() => "source").join(","),
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

      {displayIntroHtml && htmlToPlainText(displayIntroHtml).length > (intro?.length || 0) + 40 ? (
        <div data-section-type="source">
          <RichTextSection html={displayIntroHtml} tone="white" />
        </div>
      ) : null}

      {renderedSections.map((section, index) => (
        <div key={`source-${section.orderIndex}`} data-section-type="source" data-source-order={section.orderIndex}>
          <RichTextSection
            html={sectionToHtml(section)}
            tone={TONE_CYCLE[index % TONE_CYCLE.length]}
          />
        </div>
      ))}

      {!skipFinalConversion ? <FinalConversionSection /> : null}
    </InternalPageShell>
  );
}
