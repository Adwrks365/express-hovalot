import * as cheerio from "cheerio";
import type {
  Block,
  Card,
  ConversionCopy,
  Counter,
  CtaButton,
  CtaKind,
  HeroModel,
  PageModel,
  SourceHeading,
} from "@/lib/redesign/blocks";
import { inlineToText, parseElementorSections, resolveSourceImageSrc } from "@/lib/redesign/parse-elementor";
import type {
  ContentLink,
  RichBlock,
  SourceColumn,
  SourceImage,
  SourceNode,
  SourceSection,
  Widget,
} from "@/lib/redesign/types";
import { filterLaunchSitemapHref } from "@/lib/launch-sitemap";

function launchLinks(links: ContentLink[]): ContentLink[] {
  return links.filter((l) => filterLaunchSitemapHref(l.href));
}

const BADGE_FILE_RE = /^(הובלת-דירות|הובלת-דירות-אקספרס|פתרונות-אחסנה|שירותי-אריזה)\.webp$/;
const READ_MORE_RE = /^קרא עוד/;
const CTA_TEXT_RE = /חייגו|התקשרו|הצעת מחיר|השאירו פרטים|צרו קשר|052-?500/;

function fileName(src: string): string {
  const base = src.split("/").pop() || src;
  try {
    return decodeURIComponent(base);
  } catch {
    return base;
  }
}

function isBadge(img: SourceImage): boolean {
  return BADGE_FILE_RE.test(img.origin ?? fileName(img.src).replace(/^\d+-/, ""));
}

function isSmallIcon(img: SourceImage): boolean {
  return Boolean(img.width && img.width <= 170 && img.height && img.height <= 170);
}

export function blocksText(blocks: RichBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.kind) {
        case "p":
        case "h":
        case "quote":
          return inlineToText(b.html);
        case "list":
          return b.items.map(inlineToText).join(" ");
        case "table":
          return [...b.head, ...b.body].flat().map(inlineToText).join(" ");
        default:
          return "";
      }
    })
    .join(" ")
    .trim();
}

export function buttonFrom(label: string, href: string): CtaButton {
  let kind: CtaKind = "link";
  if (href.startsWith("tel:")) kind = "phone";
  else if (/wa\.me|whatsapp/.test(href)) kind = "whatsapp";
  else if (href === "#contact") kind = "contact";
  else if (href.includes("הצעת-מחיר")) kind = "quote";
  return { label, href, kind };
}

type Acc = {
  eyebrow?: SourceHeading;
  heading?: SourceHeading;
  body: RichBlock[];
  buttons: CtaButton[];
  images: SourceImage[];
  cards: Card[];
  links: ContentLink[];
  hasForm: boolean;
};

const newAcc = (): Acc => ({ body: [], buttons: [], images: [], cards: [], links: [], hasForm: false });

function accEmpty(a: Acc): boolean {
  return !a.heading && !a.eyebrow && !a.body.length && !a.images.length && !a.cards.length && !a.links.length;
}

function head(a: Acc) {
  return { eyebrow: a.eyebrow, heading: a.heading };
}

class Composer {
  blocks: Block[] = [];
  acc: Acc = newAcc();

  private emit(block: Block) {
    this.blocks.push(block);
  }

  private reset() {
    this.acc = newAcc();
  }

  flush() {
    const a = this.acc;
    if (accEmpty(a)) {
      if (a.buttons.length) this.attachOrphanButtons(a.buttons);
      this.reset();
      return;
    }
    if (!a.heading && a.body[0]?.kind === "h") {
      const first = a.body.shift() as Extract<RichBlock, { kind: "h" }>;
      a.heading = { text: inlineToText(first.html), level: first.level };
      if (/<a\s/i.test(first.html)) a.heading.html = first.html;
    }
    const textLen = blocksText(a.body).length;
    const headingText = `${a.eyebrow?.text ?? ""} ${a.heading?.text ?? ""}`;
    const hasStructure = a.body.some((b) => b.kind === "list" || b.kind === "table" || b.kind === "img");

    if (a.cards.length) {
      const variant = a.cards.some((c) => c.image) ? "image" : a.cards.some((c) => c.icon || c.badge) ? "icon" : "feature";
      if (a.images.length === 1 && variant !== "image") {
        this.emit({ type: "split", ...head(a), body: a.body, features: a.cards, buttons: a.buttons, image: a.images[0]!, imageFirst: true });
      } else {
        this.emit({ type: "cards", ...head(a), intro: a.body, cards: a.cards, buttons: a.buttons, variant });
        if (a.images.length) this.emit({ type: "prose", body: [], buttons: [], gallery: a.images, links: [] });
      }
    } else if (a.images.length === 1 && (textLen > 0 || a.heading)) {
      this.emit({ type: "split", ...head(a), body: a.body, features: [], buttons: a.buttons, image: a.images[0]!, imageFirst: true });
    } else if (
      !a.images.length &&
      !a.links.length &&
      !hasStructure &&
      textLen < (a.hasForm ? 700 : 260) &&
      (a.hasForm ||
        ((a.buttons.length > 0 || CTA_TEXT_RE.test(headingText)) &&
          CTA_TEXT_RE.test(`${headingText} ${blocksText(a.body)} ${a.buttons.map((b) => b.label).join(" ")}`)))
    ) {
      this.emit({ type: "cta", ...head(a), text: a.body, buttons: a.buttons });
    } else {
      this.emit({
        type: "prose",
        ...head(a),
        body: a.body,
        buttons: a.buttons,
        gallery: a.images,
        links: launchLinks(a.links),
      });
    }
    this.reset();
  }

  private attachOrphanButtons(buttons: CtaButton[]) {
    const prev = this.blocks[this.blocks.length - 1];
    if (prev && "buttons" in prev && prev.buttons.length === 0 && prev.type !== "cta") {
      prev.buttons.push(...buttons);
    }
  }

  heading(w: Extract<Widget, { type: "heading" }>) {
    if (READ_MORE_RE.test(w.text)) {
      if (w.href) this.acc.buttons.push({ label: w.text, href: w.href, kind: "link" });
      return;
    }
    const a = this.acc;
    const h: SourceHeading = w.href ? { text: w.text, level: w.level, href: w.href } : { text: w.text, level: w.level };
    if (a.body.length || a.images.length || a.cards.length || a.links.length || a.buttons.length || a.hasForm) {
      this.flush();
      this.acc.heading = h;
      return;
    }
    if (!a.heading) {
      a.heading = h;
    } else if (!a.eyebrow) {
      a.eyebrow = a.heading;
      a.heading = h;
    } else {
      a.body.push({ kind: "h", level: Math.min(6, Math.max(3, w.level)) as 3, html: w.text });
    }
  }

  stats(items: Counter[]) {
    const a = this.acc;
    if (a.images.length || a.cards.length || a.links.length) this.flush();
    const b = this.acc;
    this.emit({ type: "stats", ...head(b), intro: b.body, items });
    if (b.buttons.length) this.attachOrphanButtons(b.buttons);
    this.reset();
  }

  node(n: SourceNode) {
    const a = this.acc;
    switch (n.type) {
      case "row":
        this.row(n.columns);
        return;
      case "heading":
        this.heading(n);
        return;
      case "text":
        if (a.cards.length) this.flush();
        this.acc.body.push(...n.blocks);
        return;
      case "image":
        if (a.cards.length || a.images.length) this.flush();
        this.acc.images.push(n.href ? { ...n.image, href: n.href } : n.image);
        return;
      case "button":
        a.buttons.push(buttonFrom(n.label, n.href));
        return;
      case "counter":
        this.stats([{ label: n.label, value: n.value, prefix: n.prefix, suffix: n.suffix }]);
        return;
      case "faq": {
        if (a.images.length || a.cards.length) this.flush();
        const b = this.acc;
        this.emit({ type: "faq", ...head(b), intro: b.body, items: n.items, image: null, buttons: b.buttons });
        this.reset();
        return;
      }
      case "box":
        a.cards.push(cardFromBox(n, null));
        return;
      case "iconList": {
        const linked = n.items.filter((i) => i.href);
        if (linked.length === n.items.length) {
          a.links.push(...launchLinks(linked.map((i) => ({ href: i.href!, label: i.label }))));
        } else {
          a.body.push({ kind: "list", ordered: false, items: n.items.map((i) => i.label) });
        }
        return;
      }
      case "carousel": {
        if (!accEmptyExceptHeading(a)) this.flush();
        const b = this.acc;
        this.emit({ type: "logos", ...head(b), logos: n.images });
        this.reset();
        return;
      }
      case "map": {
        if (a.images.length || a.cards.length) this.flush();
        const b = this.acc;
        this.emit({ type: "map", ...head(b), body: b.body, src: n.src, title: n.title });
        this.reset();
        return;
      }
      case "table":
        a.body.push(n.table);
        return;
      case "calculator": {
        if (a.images.length || a.cards.length) this.flush();
        const b = this.acc;
        this.emit({ type: "calculator", ...head(b), intro: b.body });
        if (b.buttons.length) this.attachOrphanButtons(b.buttons);
        this.reset();
        return;
      }
      case "priceList": {
        if (a.images.length || a.cards.length) this.flush();
        const b = this.acc;
        this.emit({ type: "priceList", ...head(b), intro: b.body, items: n.items });
        this.reset();
        return;
      }
      case "video": {
        if (a.images.length || a.cards.length) this.flush();
        const b = this.acc;
        this.emit({ type: "video", ...head(b), body: b.body, url: n.url, poster: n.poster });
        this.reset();
        return;
      }
      case "reviews":
        this.flush();
        this.emit({ type: "reviews" });
        return;
      case "sitemap":
        this.flush();
        this.emit({
          type: "sitemap",
          groups: n.groups
            .map((g) => ({ ...g, links: launchLinks(g.links) }))
            .filter((g) => g.links.length > 0),
        });
        return;
      case "posts":
        this.flush();
        this.emit({ type: "posts" });
        return;
      case "form":
        a.hasForm = true;
        return;
    }
  }

  row(columns: SourceColumn[]) {
    if (
      columns.length &&
      columns.every((c) => c.items[0]?.type === "counter" && c.items.slice(1).every((i) => i.type === "text" || i.type === "counter"))
    ) {
      const items: Counter[] = [];
      for (const c of columns) {
        for (const i of c.items) {
          if (i.type === "counter") items.push({ label: i.label, value: i.value, prefix: i.prefix, suffix: i.suffix });
          else if (i.type === "text") {
            const last = items[items.length - 1]!;
            const html = i.blocks.map((b) => ("html" in b ? b.html : "")).filter(Boolean).join(" ");
            last.description = last.description ? `${last.description} ${html}` : html;
          }
        }
      }
      this.stats(items);
      return;
    }
    if (columns.length >= 2 && columns.every(isCardColumn)) {
      if (this.acc.images.length) this.flush();
      this.acc.cards.push(...columns.map(cardFromColumn));
      return;
    }
    if (columns.length && columns.every((c) => c.items.every((i) => i.type === "button"))) {
      for (const c of columns) for (const i of c.items) this.node(i);
      return;
    }
    for (const c of columns) for (const i of c.items) this.node(i);
  }
}

function accEmptyExceptHeading(a: Acc): boolean {
  return !a.body.length && !a.images.length && !a.cards.length && !a.links.length;
}

function isCardColumn(col: SourceColumn): boolean {
  const items = col.items;
  if (!items.length || items.length > 6) return false;
  if (items.some((i) => i.type === "row" || i.type === "faq" || i.type === "counter" || i.type === "form" || i.type === "carousel" || i.type === "map")) return false;
  const boxes = items.filter((i) => i.type === "box").length;
  const headings = items.filter((i) => i.type === "heading" && !READ_MORE_RE.test(i.text)).length;
  const images = items.filter((i) => i.type === "image").length;
  if (boxes === 1) return images <= 1;
  return headings === 1 && images <= 1;
}

function cardFromBox(box: Extract<Widget, { type: "box" }>, extraImage: SourceImage | null): Card {
  const body: RichBlock[] = box.description ? [{ kind: "p", html: box.description }] : [];
  return {
    title: box.title,
    titleLevel: 3,
    body,
    image: box.image,
    badge: extraImage,
    icon: box.icon,
    href: box.href ?? null,
  };
}

function cardFromColumn(col: SourceColumn): Card {
  const box = col.items.find((i) => i.type === "box") as Extract<Widget, { type: "box" }> | undefined;
  const imageW = col.items.find((i) => i.type === "image") as Extract<Widget, { type: "image" }> | undefined;
  const button = col.items.find((i) => i.type === "button") as Extract<Widget, { type: "button" }> | undefined;
  if (box) {
    const card = cardFromBox(box, box.image ? imageW?.image ?? null : null);
    if (!box.image && imageW) card.image = imageW.image;
    const extra = col.items.flatMap((i) => (i.type === "text" ? i.blocks : []));
    if (extra.length) card.body.push(...extra);
    if (button) card.actions = [buttonFrom(button.label, button.href)];
    return card;
  }
  const h = col.items.find((i) => i.type === "heading" && !READ_MORE_RE.test(i.text)) as Extract<Widget, { type: "heading" }>;
  const readMore = col.items.filter(
    (i): i is Extract<Widget, { type: "heading" }> => i.type === "heading" && READ_MORE_RE.test(i.text) && Boolean(i.href),
  );
  const body = col.items.flatMap((i) => (i.type === "text" ? i.blocks : []));
  const image = imageW?.image ?? null;
  const smallIcon = image && isSmallIcon(image) ? image : null;
  return {
    title: h.text,
    titleLevel: h.level,
    body,
    image: smallIcon ? null : image,
    badge: smallIcon,
    icon: null,
    href: h.href || imageW?.href || button?.href || null,
    actions: [
      ...(button ? [buttonFrom(button.label, button.href)] : []),
      ...readMore.map((r) => ({ label: r.text, href: r.href!, kind: "link" as const })),
    ],
  };
}

function flattenNodes(nodes: SourceNode[]): Widget[] {
  return nodes.flatMap((n) => (n.type === "row" ? n.columns.flatMap((c) => flattenNodes(c.items)) : [n]));
}

function composeSection(c: Composer, section: SourceSection) {
  const cols = section.columns;
  if (cols.length >= 2) {
    const imageCols = cols.filter((col) => col.items.length === 1 && col.items[0]!.type === "image");
    const contentCols = cols.filter((col) => !imageCols.includes(col) && flattenNodes(col.items).length);
    if (imageCols.length === 1 && contentCols.length >= 1) {
      const imageWidget = imageCols[0]!.items[0] as Extract<Widget, { type: "image" }>;
      const image = imageWidget.href ? { ...imageWidget.image, href: imageWidget.href } : imageWidget.image;
      const imageFirst = cols.indexOf(imageCols[0]!) === 0;
      const start = c.blocks.length;
      for (const col of contentCols) for (const n of col.items) c.node(n);
      c.flush();
      attachImage(c, start, image, imageFirst);
      return;
    }
    if (cols.every(isCardColumn) && cols.some((col) => col.items.some((i) => i.type === "box"))) {
      c.flush();
      c.acc.cards.push(...cols.map(cardFromColumn));
      c.flush();
      return;
    }
  }
  for (const col of cols) for (const n of col.items) c.node(n);
  c.flush();
}

function attachImage(c: Composer, start: number, image: SourceImage, imageFirst: boolean) {
  const target = c.blocks.slice(start).find((b) => b.type === "prose" || b.type === "faq" || (b.type === "cards" && b.variant !== "image"));
  if (!target) {
    c.blocks.push({ type: "prose", body: [], buttons: [], gallery: [image], links: [] });
    return;
  }
  const idx = c.blocks.indexOf(target);
  if (target.type === "faq") {
    target.image = image;
    return;
  }
  if (target.type === "prose") {
    c.blocks[idx] = {
      type: "split",
      eyebrow: target.eyebrow,
      heading: target.heading,
      body: target.body,
      features: [],
      buttons: target.buttons,
      image,
      imageFirst,
    };
    if (target.gallery.length || target.links.length) {
      c.blocks.splice(idx + 1, 0, { type: "prose", body: [], buttons: [], gallery: target.gallery, links: target.links });
    }
    return;
  }
  if (target.type === "cards") {
    c.blocks[idx] = {
      type: "split",
      eyebrow: target.eyebrow,
      heading: target.heading,
      body: target.intro,
      features: target.cards,
      buttons: target.buttons,
      image,
      imageFirst,
    };
  }
}

function unescapeJsonUrl(raw: string): string {
  return raw.replace(/\\\//g, "/").replace(/\\u([0-9a-f]{4})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)));
}

/** Background image(s) of the first source section: slideshow gallery or single background image. */
function heroBackgrounds(contentHtml: string): SourceImage[] {
  const $ = cheerio.load(contentHtml || "");
  $(".elementor-hidden-desktop").remove();
  const settings = $('[data-element_type="section"]').first().attr("data-settings") || "";
  const gallery = settings.match(/"background_slideshow_gallery":\[(.*?)\]/);
  const urls = gallery
    ? [...gallery[1]!.matchAll(/"url":"([^"]+)"/g)].map((m) => m[1]!)
    : [settings.match(/"background_image":\{"url":"([^"]+)"/)?.[1]].filter((u): u is string => Boolean(u));
  const out: SourceImage[] = [];
  for (const raw of urls) {
    const src = resolveSourceImageSrc(unescapeJsonUrl(raw));
    if (src && !out.some((o) => o.src === src)) out.push({ src, alt: "" });
  }
  return out;
}

function extractHero(sections: SourceSection[], title: string, featured: string | null): { hero: HeroModel; rest: SourceSection[]; leftover: RichBlock[]; conversion: ConversionCopy } {
  const hero: HeroModel = {
    title,
    eyebrow: null,
    subtitles: [],
    lead: [],
    buttons: [],
    image: null,
    icon: null,
    badges: [],
    background: null,
  };
  const conversion: ConversionCopy = { title: null, text: null };
  const leftover: RichBlock[] = [];
  const first = sections[0];
  const firstWidgets = first ? first.columns.flatMap((col) => flattenNodes(col.items)) : [];
  const h1 = firstWidgets.find((w) => w.type === "heading" && w.level === 1) as Extract<Widget, { type: "heading" }> | undefined;

  if (!first || !h1) {
    if (featured) hero.image = { src: featured, alt: title };
    return { hero, rest: sections, leftover, conversion };
  }

  hero.title = h1.text;
  for (const col of first.columns) {
    const widgets = flattenNodes(col.items);
    const hasForm = widgets.some((w) => w.type === "form");
    const hasH1 = widgets.includes(h1);
    if (hasForm && !hasH1) {
      const h = widgets.find((w) => w.type === "heading") as Extract<Widget, { type: "heading" }> | undefined;
      const t = widgets.filter((w) => w.type === "text").flatMap((w) => (w as Extract<Widget, { type: "text" }>).blocks);
      conversion.title = h?.text ?? null;
      conversion.text = blocksText(t) || null;
      continue;
    }
    let seenH1 = false;
    for (const w of widgets) {
      if (w === h1) {
        seenH1 = true;
        continue;
      }
      switch (w.type) {
        case "heading":
          if (READ_MORE_RE.test(w.text)) break;
          if (!seenH1 && !hero.eyebrow) hero.eyebrow = w.text;
          else hero.subtitles.push(w.text);
          break;
        case "text": {
          for (const b of w.blocks) {
            const leadLen = hero.lead.map(inlineToText).join(" ").length;
            if (b.kind === "h" && !hero.lead.length && !leftover.length) hero.subtitles.push(inlineToText(b.html));
            else if (b.kind === "p" && leadLen + inlineToText(b.html).length <= 440 && !leftover.length) hero.lead.push(b.html);
            else leftover.push(b);
          }
          break;
        }
        case "button":
          hero.buttons.push(buttonFrom(w.label, w.href));
          break;
        case "image":
          if (isBadge(w.image)) hero.badges.push(w.href ? { ...w.image, href: w.href } : w.image);
          else if (isSmallIcon(w.image)) hero.icon = w.image;
          else if (!hero.image) hero.image = w.image;
          else leftover.push({ kind: "img", src: w.image.src, alt: w.image.alt });
          break;
        default:
          break;
      }
    }
  }
  if (!hero.image && featured && !hero.badges.length) hero.image = { src: featured, alt: hero.title };
  return { hero, rest: sections.slice(1), leftover, conversion };
}

/** Group runs of short sibling prose blocks (e.g. per-service paragraphs) into card grids. */
function groupSiblingProse(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i]!;
    const isItem = (x: Block | undefined): x is Extract<Block, { type: "prose" }> =>
      Boolean(
        x &&
          x.type === "prose" &&
          x.heading &&
          !x.eyebrow &&
          !x.gallery.length &&
          !x.links.length &&
          x.body.length > 0 &&
          !x.body.some((r) => r.kind === "table" || r.kind === "img" || r.kind === "h") &&
          blocksText(x.body).length < 1100,
      );
    if (isItem(b)) {
      let j = i;
      while (j < blocks.length && isItem(blocks[j]) && (blocks[j] as { heading: SourceHeading }).heading.level === b.heading!.level) j++;
      if (j - i >= 3) {
        let run = blocks.slice(i, j) as Extract<Block, { type: "prose" }>[];
        let lead: Extract<Block, { type: "prose" }> | null = null;
        if (run[0]!.heading!.text.trim().endsWith("?") && !run.slice(1).some((p) => p.heading!.text.trim().endsWith("?"))) {
          lead = run[0]!;
          run = run.slice(1);
        }
        out.push({
          type: "cards",
          heading: lead?.heading,
          intro: lead?.body ?? [],
          cards: run.map((p) => ({
            title: p.heading!.text,
            titleLevel: p.heading!.level,
            body: p.body,
            image: null,
            badge: null,
            icon: null,
            href: p.heading!.href ?? null,
            actions: p.buttons.filter((x) => x.kind === "link"),
          })),
          buttons: run
            .flatMap((p) => p.buttons.filter((x) => x.kind !== "link"))
            .filter((x, k, all) => all.findIndex((y) => y.href === x.href && y.label === x.label) === k),
          variant: "feature",
        });
        i = j;
        continue;
      }
    }
    out.push(b);
    i++;
  }
  return out;
}

/** Attach a heading-only / short-intro prose block to the card grid or stats that follows it. */
function mergeIntroIntoNext(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    const next = blocks[i + 1];
    if (
      b.type === "prose" &&
      b.heading &&
      !b.gallery.length &&
      !b.links.length &&
      !b.buttons.length &&
      blocksText(b.body).length < 700 &&
      !b.body.some((r) => r.kind !== "p") &&
      next &&
      (next.type === "cards" || next.type === "stats" || next.type === "logos") &&
      !next.heading &&
      !(next.type === "stats" && (b.heading.text.trim().endsWith(":") || CTA_TEXT_RE.test(b.heading.text) || blocksText(b.body).length > 220))
    ) {
      next.heading = b.heading;
      next.eyebrow = b.eyebrow;
      if (next.type !== "logos") next.intro = [...b.body, ...next.intro];
      else if (b.body.length) {
        out.push(b);
        continue;
      }
      continue;
    }
    out.push(b);
  }
  return out;
}

function mergeStats(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    if (b.type === "stats") b.items = b.items.filter((i) => /^\d/.test(i.value));
    if (b.type === "stats" && !b.items.length) continue;
    if (b.type === "stats" && prev?.type === "stats" && !b.heading && !blocksText(b.intro).trim()) {
      prev.items.push(...b.items);
      if (b.eyebrow && !prev.eyebrow) prev.eyebrow = b.eyebrow;
      continue;
    }
    out.push(b);
  }
  return out;
}

function ctaKey(b: Extract<Block, { type: "cta" }>): string {
  return `${b.eyebrow?.text ?? ""}|${b.heading?.text ?? ""}|${blocksText(b.text)}`;
}

/** Remove repeated identical CTA prompts and empty CTAs; keep first occurrence. */
function dedupeCtas(blocks: Block[]): Block[] {
  const seen = new Set<string>();
  return blocks.filter((b, i) => {
    if (b.type !== "cta") return true;
    const key = ctaKey(b);
    if (key === "||") return false;
    if (seen.has(key)) return false;
    seen.add(key);
    const prev = blocks[i - 1];
    if (prev?.type === "cta") {
      prev.buttons.push(...b.buttons.filter((x) => !prev.buttons.some((y) => y.href === x.href && y.label === x.label)));
      if (!prev.heading && b.heading) prev.heading = b.heading;
      else if (b.heading) prev.text.push({ kind: "p", html: b.heading.text });
      prev.text.push(...b.text);
      return false;
    }
    return true;
  });
}

export function composePage(record: { title: string; contentHtml: string; featuredImage?: string | null }): PageModel {
  const sections = parseElementorSections(record.contentHtml);
  const { hero, rest, leftover, conversion } = extractHero(sections, record.title, record.featuredImage ?? null);
  const backgrounds = heroBackgrounds(record.contentHtml);
  hero.background = backgrounds[0] ?? null;
  hero.backgroundSlides = backgrounds.slice(1);

  const c = new Composer();
  if (leftover.length) {
    c.acc.body.push(...leftover);
    c.flush();
  }
  for (const s of rest) composeSection(c, s);
  c.flush();

  let blocks = mergeIntroIntoNext(groupSiblingProse(mergeStats(c.blocks)));
  blocks = dedupeCtas(blocks);
  return { hero, blocks, conversion };
}
