import type { FaqItem } from "@/components/content/FaqAccordion";
import type { FeatureCard } from "@/lib/structured-pages/types";

export type CompositionBlock =
  | { type: "prose"; id: string; heading?: string | null; html: string }
  | { type: "imageText"; id: string; image: string; imageAlt: string; html: string; imagePosition: "start" | "end" }
  | {
      type: "benefitGrid";
      id: string;
      heading?: string | null;
      items: { icon?: string | null; title: string; description: string }[];
    }
  | {
      type: "featureGrid";
      id: string;
      heading?: string | null;
      introHtml?: string | null;
      cards: FeatureCard[];
    }
  | { type: "areaLinks"; id: string; heading: string; links: { href: string; label: string }[] }
  | { type: "logoGrid"; id: string; heading?: string | null; logos: { src: string; alt: string }[] }
  | { type: "faq"; id: string; heading?: string | null; introHtml?: string | null; items: FaqItem[] }
  | { type: "ctaTop"; id: string; heading?: string | null }
  | { type: "remaining"; id: string; html: string; orderIndex: number };

export type RemovedContentLog = {
  sectionIndex: number;
  fingerprint: string;
  reason: string;
};

export type RemainingContentBlock = {
  id: string;
  html: string;
  orderIndex: number;
};

export type PageComposition = {
  introHtml: string | null;
  blocks: CompositionBlock[];
  remainingContentBlocks: RemainingContentBlock[];
  coverageRatio: number;
  rawFallbackUsed: boolean;
  removedDuplicates: RemovedContentLog[];
};
