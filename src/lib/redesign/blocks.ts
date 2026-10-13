import type { ContentLink, InlineHtml, RichBlock, SourceImage } from "@/lib/redesign/types";

/** `as` is the rendered level chosen by normalizeHeadingLevels when the source level would skip a level. */
/** `html` keeps inline links when a rich-text heading is promoted; `text` stays the plain-text form. */
export type SourceHeading = { text: string; level: number; href?: string; as?: 2 | 3 | 4; html?: string };

export type CtaKind = "phone" | "whatsapp" | "quote" | "contact" | "link";

export type CtaButton = { label: string; href: string; kind: CtaKind };

export type Card = {
  title: string;
  titleLevel: number;
  titleAs?: 2 | 3 | 4;
  body: RichBlock[];
  image: SourceImage | null;
  badge: SourceImage | null;
  icon: string | null;
  href: string | null;
  actions?: CtaButton[];
};

export type Counter = { label: string; value: string; prefix: string; suffix: string; description?: InlineHtml };

export type FaqEntry = { question: string; answer: RichBlock[] };

type Head = { eyebrow?: SourceHeading; heading?: SourceHeading };

export type Block =
  | ({ type: "prose"; body: RichBlock[]; buttons: CtaButton[]; gallery: SourceImage[]; links: ContentLink[] } & Head)
  | ({ type: "split"; body: RichBlock[]; features: Card[]; buttons: CtaButton[]; image: SourceImage; imageFirst: boolean } & Head)
  | ({ type: "cards"; intro: RichBlock[]; cards: Card[]; buttons: CtaButton[]; variant: "image" | "icon" | "feature" } & Head)
  | ({ type: "stats"; intro: RichBlock[]; items: Counter[] } & Head)
  | ({ type: "faq"; intro: RichBlock[]; items: FaqEntry[]; image: SourceImage | null; buttons: CtaButton[] } & Head)
  | ({ type: "cta"; text: RichBlock[]; buttons: CtaButton[] } & Head)
  | ({ type: "logos"; logos: SourceImage[] } & Head)
  | { type: "reviews" }
  | ({ type: "map"; body: RichBlock[]; src: string; title: string } & Head)
  | ({ type: "priceList"; intro: RichBlock[]; items: { title: string; price: string; description: string }[] } & Head)
  | ({ type: "calculator"; intro: RichBlock[] } & Head)
  | ({ type: "video"; body: RichBlock[]; url: string; poster: SourceImage | null } & Head)
  | ({ type: "links"; links: ContentLink[] } & Head)
  | { type: "sitemap"; groups: { title: string; links: ContentLink[] }[] }
  | { type: "posts" };

export type HeroModel = {
  title: string;
  eyebrow: string | null;
  subtitles: string[];
  lead: InlineHtml[];
  buttons: CtaButton[];
  image: SourceImage | null;
  icon: SourceImage | null;
  badges: SourceImage[];
  background: SourceImage | null;
  /** Remaining slides of a source background slideshow (crossfaded behind the first). */
  backgroundSlides?: SourceImage[];
};

export type ConversionCopy = { title: string | null; text: string | null };

export type PageModel = {
  hero: HeroModel;
  blocks: Block[];
  conversion: ConversionCopy;
};
