import { AreaLinksSection } from "@/components/sections/AreaLinksSection";
import { LogoGridSection } from "@/components/sections/LogoGridSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ProseSection } from "@/components/structured-content/ProseSection";
import { ServiceCardsSection } from "@/components/structured-content/ServiceCardsSection";
import { StructuredBenefitGridSection } from "@/components/structured-content/StructuredBenefitGridSection";
import { StructuredFaqSection } from "@/components/structured-content/StructuredFaqSection";
import { StructuredImageTextSection } from "@/components/structured-content/StructuredImageTextSection";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import type { StructuredPageSection } from "@/lib/structured-content/types";

const TONE_CYCLE: SectionTone[] = ["white", "muted", "white", "neutral", "brand", "white", "muted"];

export function toneForSectionIndex(index: number, type: StructuredPageSection["type"]): SectionTone {
  if (type === "stats") return "brand";
  return TONE_CYCLE[index % TONE_CYCLE.length] ?? "white";
}

export function renderStructuredSection(section: StructuredPageSection, index: number) {
  const tone = toneForSectionIndex(index, section.type);
  const key = section.id;

  switch (section.type) {
    case "prose":
      return (
        <ProseSection
          key={key}
          heading={section.heading}
          body={section.body}
          links={section.links}
          tone={tone}
        />
      );
    case "imageText":
      return (
        <StructuredImageTextSection
          key={key}
          heading={section.heading}
          image={section.image}
          imageAlt={section.imageAlt}
          body={section.body}
          links={section.links}
          imagePosition={section.imagePosition}
          tone={tone}
        />
      );
    case "benefitGrid":
      return (
        <StructuredBenefitGridSection key={key} heading={section.heading} items={section.items} tone={tone} />
      );
    case "serviceCards":
      return (
        <ServiceCardsSection
          key={key}
          heading={section.heading}
          intro={section.intro}
          cards={section.cards}
          tone={tone === "brand" ? "muted" : tone}
        />
      );
    case "stats":
      return <StatsSection key={key} items={section.items} tone="brand" />;
    case "faq":
      return (
        <StructuredFaqSection
          key={key}
          heading={section.heading}
          intro={section.intro}
          items={section.items}
          tone={tone}
        />
      );
    case "areaLinks":
      return <AreaLinksSection key={key} heading={section.heading} links={section.links} tone={tone} />;
    case "logoGrid":
      return <LogoGridSection key={key} title={section.heading} logos={section.logos} tone={tone} />;
    default:
      return null;
  }
}
