/** Sanitized inline HTML: text plus <a>, <strong>, <em>, <br> only. */
export type InlineHtml = string;

export type RichBlock =
  | { kind: "p"; html: InlineHtml }
  | { kind: "h"; level: 2 | 3 | 4 | 5 | 6; html: InlineHtml; as?: 2 | 3 | 4 }
  | { kind: "list"; ordered: boolean; items: InlineHtml[] }
  | { kind: "table"; head: InlineHtml[][]; body: InlineHtml[][] }
  | { kind: "img"; src: string; alt: string }
  | { kind: "quote"; html: InlineHtml };

export type SourceImage = { src: string; alt: string; width?: number; height?: number; origin?: string; href?: string };

export type ContentLink = { href: string; label: string };

export type Widget =
  | { type: "heading"; level: number; text: string; href?: string | null }
  | { type: "text"; blocks: RichBlock[] }
  | { type: "image"; image: SourceImage; href?: string | null }
  | { type: "button"; label: string; href: string }
  | { type: "counter"; label: string; value: string; prefix: string; suffix: string }
  | { type: "faq"; items: { question: string; answer: RichBlock[] }[] }
  | { type: "box"; image: SourceImage | null; icon: string | null; title: string; description: InlineHtml; href?: string | null }
  | { type: "iconList"; items: { label: string; href: string | null }[] }
  | { type: "carousel"; images: SourceImage[] }
  | { type: "map"; src: string; title: string }
  | { type: "table"; table: Extract<RichBlock, { kind: "table" }> }
  | { type: "calculator" }
  | { type: "priceList"; items: { title: string; price: string; description: string }[] }
  | { type: "video"; url: string; poster: SourceImage | null }
  | { type: "reviews" }
  | { type: "sitemap"; groups: { title: string; links: ContentLink[] }[] }
  | { type: "posts" }
  | { type: "form" };

export type SourceNode = Widget | SourceRow;

export type SourceColumn = { items: SourceNode[] };

export type SourceRow = { type: "row"; columns: SourceColumn[] };

export type SourceSection = { index: number; columns: SourceColumn[] };
