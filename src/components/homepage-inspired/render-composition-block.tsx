import { InternalCTA } from "@/components/internal/InternalCTA";
import { AreaLinksSection } from "@/components/sections/AreaLinksSection";
import { FaqSectionBlock } from "@/components/sections/FaqSectionBlock";
import { FeatureGridSection } from "@/components/sections/FeatureGridSection";
import { IconFeatureGridSection } from "@/components/sections/IconFeatureGridSection";
import { ImageTextSection } from "@/components/sections/ImageTextSection";
import { LogoGridSection } from "@/components/sections/LogoGridSection";
import { RemainingSourceContentSection } from "@/components/sections/RemainingSourceContentSection";
import { RichTextSection } from "@/components/sections/RichTextSection";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import type { CompositionBlock } from "@/lib/page-composition/types";

export function renderCompositionBlock(
  block: CompositionBlock,
  tone: SectionTone,
  options: { animate?: boolean } = {},
) {
  const animate = options.animate ?? false;
  const sectionProps = { "data-section-type": block.type };

  switch (block.type) {
    case "prose":
      return (
        <div key={block.id} {...sectionProps}>
          <RichTextSection html={block.html} tone={tone} animate={animate} />
        </div>
      );
    case "imageText":
      return (
        <div key={block.id} {...sectionProps}>
          <ImageTextSection
            image={block.image}
            imageAlt={block.imageAlt}
            html={block.html}
            imagePosition={block.imagePosition}
            tone={tone}
            animate={animate}
          />
        </div>
      );
    case "benefitGrid":
      return (
        <div key={block.id} {...sectionProps}>
          <IconFeatureGridSection title={block.heading} items={block.items} tone={tone} />
        </div>
      );
    case "featureGrid":
      return (
        <div key={block.id} {...sectionProps}>
          <FeatureGridSection
            title={block.heading}
            introHtml={block.introHtml}
            cards={block.cards}
            tone={tone}
          />
        </div>
      );
    case "areaLinks":
      return (
        <div key={block.id} {...sectionProps}>
          <AreaLinksSection heading={block.heading} links={block.links} tone={tone} />
        </div>
      );
    case "logoGrid":
      return (
        <div key={block.id} {...sectionProps}>
          <LogoGridSection title={block.heading} logos={block.logos} tone={tone} />
        </div>
      );
    case "faq":
      return (
        <div key={block.id} {...sectionProps}>
          <FaqSectionBlock
            introHtml={block.introHtml || undefined}
            items={block.items}
            showHeading={false}
            tone={tone}
          />
        </div>
      );
    case "ctaTop":
      return (
        <section key={block.id} {...sectionProps} className="bg-brand-50/45 py-10 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-[62.5rem] px-4 sm:px-6">
            <InternalCTA title={block.heading || undefined} animate={animate} />
          </div>
        </section>
      );
    case "remaining":
      return (
        <RemainingSourceContentSection key={block.id} html={block.html} tone={tone} animate={animate} />
      );
    default:
      return null;
  }
}
