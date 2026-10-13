export type StructuredButton = { href: string; label: string };

export type StructuredBlock =
  | { type: "richText"; id: string; html: string }
  | { type: "featureGrid"; id: string; title?: string | null; introHtml?: string | null; cards: FeatureCard[] }
  | { type: "storageSolutionsGrid"; id: string; title?: string | null; introHtml?: string | null; cards: FeatureCard[] }
  | {
      type: "conversionSection";
      id: string;
      introHtml?: string | null;
      formVariant?: "quote" | "contact" | "lead";
      formTitle?: string | null;
      showForm?: boolean;
    }
  | {
      type: "iconFeatureGrid";
      id: string;
      title?: string | null;
      items: { icon?: string | null; title: string; description: string }[];
    }
  | { type: "imageText"; id: string; image?: string | null; imageAlt?: string; html: string; imagePosition?: "start" | "end" }
  | { type: "faq"; id: string; introHtml?: string | null; items: { question: string; answer: string }[] }
  | { type: "formBlock"; id: string; title?: string | null; bodyHtml?: string | null }
  | { type: "ctaStrip"; id: string; buttons: StructuredButton[] }
  | { type: "stats"; id: string; items: { label: string; value?: string }[] }
  | { type: "logoGrid"; id: string; title?: string | null; logos: { src: string; alt: string }[] };

export type FeatureCard = {
  image?: string | null;
  imageAlt?: string;
  title: string;
  descriptionHtml: string;
};

export type StructuredHero = {
  image?: string | null;
  intro?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  variant?: "service" | "standard" | "about";
};

export type StructuredPageData = {
  path: string;
  wpId: number;
  title: string;
  sourceRef: string;
  hero: StructuredHero;
  blocks: StructuredBlock[];
};
