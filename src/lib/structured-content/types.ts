import type { FaqItem } from "@/components/content/FaqAccordion";

export type ContentLink = { href: string; label: string };

export type ListBlock = { type: "ul" | "ol"; items: string[] };

/** Plain content — no layout HTML */
export type ProseContent = {
  paragraphs: string[];
  lists?: ListBlock[];
  /** Tables only — allowed raw HTML fragment */
  tableHtml?: string | null;
};

export type PageHeroModel = {
  title: string;
  intro: string | null;
  image: string | null;
  imageAlt: string;
  showQuoteCta: boolean;
  variant: "service" | "standard" | "editorial";
};

export type StructuredPageSection =
  | {
      type: "prose";
      id: string;
      heading: string | null;
      eyebrow?: string | null;
      body: ProseContent;
      links: ContentLink[];
    }
  | {
      type: "imageText";
      id: string;
      heading: string | null;
      image: string;
      imageAlt: string;
      imagePosition: "start" | "end";
      body: ProseContent;
      links: ContentLink[];
    }
  | {
      type: "benefitGrid";
      id: string;
      heading: string | null;
      items: { icon?: string | null; title: string; description: string }[];
    }
  | {
      type: "serviceCards";
      id: string;
      heading: string | null;
      intro: ProseContent | null;
      cards: {
        title: string;
        description: string;
        image: string | null;
        imageAlt: string;
        href?: string | null;
      }[];
    }
  | { type: "stats"; id: string; heading: string | null; items: { label: string; value?: string }[] }
  | {
      type: "faq";
      id: string;
      heading: string | null;
      intro: ProseContent | null;
      items: FaqItem[];
    }
  | { type: "areaLinks"; id: string; heading: string; links: ContentLink[] }
  | { type: "logoGrid"; id: string; heading: string | null; logos: { src: string; alt: string }[] };

export type StructuredPageKind = "commercial" | "contact" | "faq" | "about" | "quote" | "article";

export type StructuredPageModel = {
  kind: StructuredPageKind;
  hero: PageHeroModel;
  intro: ProseContent | null;
  sections: StructuredPageSection[];
  showFinalConversion: boolean;
  metrics: {
    designedSections: number;
    proseSections: number;
    rawHtmlBlocks: number;
  };
};
