import { InternalPageShell } from "@/components/internal/InternalPageShell";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { FooterSocialIcons } from "@/components/layout/FooterSocialIcons";
import { Container } from "@/components/ui/Container";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  CalculatorView,
  CardsView,
  CtaStripView,
  FaqView,
  LinksView,
  LogosView,
  MapView,
  PriceListView,
  ProseView,
  ReviewsView,
  SitemapView,
  SplitView,
  StatsView,
  VideoView,
} from "@/components/redesign/BlockViews";
import { WhatsAppIcon } from "@/components/redesign/CtaButtons";
import { RecentPostsView } from "@/components/redesign/RecentPostsView";
import { DEFAULT_TITLE, RedesignConversion } from "@/components/redesign/RedesignConversion";
import { RedesignHero } from "@/components/redesign/RedesignHero";
import { RichContent } from "@/components/redesign/RichContent";
import type { SectionTone } from "@/components/redesign/Section";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";
import { resolveRedesignArchetype, type RedesignArchetype } from "@/lib/redesign/archetype";
import { heroFormCopy, normalizeHeroButtonsWithForm, shouldShowHeroForm } from "@/lib/redesign/hero-form";
import type { Block, CtaKind, HeroModel, PageModel } from "@/lib/redesign/blocks";
import { AccessibilityStatementAddendum } from "@/components/accessibility/AccessibilityStatementAddendum";
import { PopupPageRegistrar } from "@/components/popups/PopupPageRegistrar";
import { composePage } from "@/lib/redesign/compose";
import { normalizeHeadingLevels } from "@/lib/redesign/heading-levels";
import { resolveSourceImageSrc } from "@/lib/redesign/parse-elementor";
import type { RichBlock } from "@/lib/redesign/types";

type Toned = { block: Block; tone: SectionTone };

/** Alternating white / light-green rhythm; stats and reviews are the only dark bands. */
function assignTones(blocks: Block[]): Toned[] {
  const out: Toned[] = [];
  let last: SectionTone = "dark";
  let lastLight: SectionTone = "mist";
  for (const block of blocks) {
    let tone: SectionTone;
    if (block.type === "stats" || block.type === "reviews") {
      tone = "dark";
    } else if (block.type === "cta") {
      tone = last === "dark" ? "white" : last;
    } else if (block.type === "calculator") {
      tone = "mist";
    } else {
      tone = lastLight === "white" ? "mist" : "white";
    }
    if (tone !== "dark" && block.type !== "cta") lastLight = tone;
    last = tone;
    out.push({ block, tone });
  }
  return out;
}

function renderBlock({ block, tone }: Toned, key: number, stacked = false, quiet = false) {
  switch (block.type) {
    case "prose":
      return <ProseView key={key} block={block} tone={tone} stacked={stacked} />;
    case "split":
      return <SplitView key={key} block={block} tone={tone} />;
    case "cards":
      return <CardsView key={key} block={block} tone={tone} />;
    case "stats":
      return <StatsView key={key} block={block} />;
    case "faq":
      return <FaqView key={key} block={block} tone={tone} />;
    case "cta":
      return <CtaStripView key={key} block={block} tone={tone} quiet={quiet} />;
    case "logos":
      return <LogosView key={key} block={block} tone={tone} />;
    case "reviews":
      return <ReviewsView key={key} />;
    case "map":
      return <MapView key={key} block={block} tone={tone} />;
    case "priceList":
      return <PriceListView key={key} block={block} tone={tone} />;
    case "calculator":
      return <CalculatorView key={key} block={block} />;
    case "video":
      return <VideoView key={key} block={block} tone={tone} />;
    case "links":
      return <LinksView key={key} block={block} tone={tone} />;
    case "sitemap":
      return <SitemapView key={key} block={block} tone={tone} />;
    case "posts":
      return <RecentPostsView key={key} />;
    default:
      return null;
  }
}

type ConversionProps = { title: string | null; text: string | null; body?: RichBlock[] };

/** A trailing source CTA prompt becomes the copy of the single closing conversion block. */
function foldTrailingCta(model: PageModel): { blocks: Block[]; conversion: ConversionProps } {
  const blocks = [...model.blocks];
  const conversion: ConversionProps = { ...model.conversion };
  const last = blocks[blocks.length - 1];
  if (!conversion.title && last?.type === "cta" && (last.heading || last.eyebrow)) {
    blocks.pop();
    const title = last.heading?.text ?? last.eyebrow!.text;
    const body: RichBlock[] = [];
    if (last.heading && last.eyebrow) body.push({ kind: "p", html: last.eyebrow.text });
    body.push(...last.text);
    conversion.title = title;
    conversion.body = body;
  }
  return { blocks, conversion };
}

const bareText = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, "");

/**
 * When the closing conversion would fall back to its default title and a source strip already
 * carries that same prompt, the strip becomes the conversion copy so the prompt is shown once.
 */
function foldDuplicateConversionPrompt(blocks: Block[], conversion: ConversionProps): { blocks: Block[]; conversion: ConversionProps } {
  if (conversion.title) return { blocks, conversion };
  const target = bareText(DEFAULT_TITLE);
  const matches = (h?: { text: string }) => Boolean(h && bareText(h.text).startsWith(target));
  const idx = blocks.findIndex((b) => b.type === "cta" && (matches(b.heading) || matches(b.eyebrow)));
  if (idx < 0) return { blocks, conversion };
  const strip = blocks[idx] as Extract<Block, { type: "cta" }>;
  const byHeading = matches(strip.heading);
  const title = byHeading ? strip.heading!.text : strip.eyebrow!.text;
  const body: RichBlock[] = [];
  if (byHeading && strip.eyebrow) body.push({ kind: "p", html: strip.eyebrow.text });
  if (!byHeading && strip.heading) body.push({ kind: "p", html: strip.heading.text });
  body.push(...strip.text);
  return { blocks: blocks.filter((_, i) => i !== idx), conversion: { ...conversion, title, body } };
}

/** A FAQ side image that repeats an image already shown on the page is dropped. */
function dropRepeatedFaqImage(hero: HeroModel, blocks: Block[]): Block[] {
  const used = new Set<string>([hero.image?.src, hero.background?.src].filter(Boolean) as string[]);
  for (const b of blocks) {
    if (b.type === "split") used.add(b.image.src);
    if (b.type === "cards") b.cards.forEach((c) => c.image && used.add(c.image.src));
    if (b.type === "prose") b.gallery.forEach((g) => used.add(g.src));
  }
  return blocks.map((b) => (b.type === "faq" && b.image && used.has(b.image.src) ? { ...b, image: null } : b));
}

const CONVERSION_KINDS = new Set<CtaKind>(["phone", "whatsapp", "quote", "contact"]);

const DEFAULT_HERO_CTAS: { label: string; href: string; kind: CtaKind }[] = [
  { label: "הצעת מחיר", href: "#contact", kind: "quote" },
  { label: PHONE_DISPLAY, href: `tel:${PHONE_TEL}`, kind: "phone" },
];

/**
 * Hero already carries conversion (source buttons, default quote/phone, or the contact panel).
 * Drop the large CTA strip that would sit immediately under it so the two units never stack.
 */
function dropImmediatePostHeroCta(
  hero: HeroModel,
  blocks: Block[],
  opts?: { heroForm?: boolean },
): { hero: HeroModel; blocks: Block[] } {
  const idx = blocks.findIndex((b) => b.type === "cta");
  if (idx < 0 || idx > 1 || (idx === 1 && blocks[0]!.type !== "prose")) return { hero, blocks };
  const next = blocks.filter((_, i) => i !== idx);
  if (opts?.heroForm) return { hero, blocks: next };
  if (hero.buttons.some((b) => CONVERSION_KINDS.has(b.kind))) return { hero, blocks: next };
  return { hero: { ...hero, buttons: [...hero.buttons, ...DEFAULT_HERO_CTAS] }, blocks: next };
}

/** Strips close to another conversion module (or to the closing conversion) render as a quiet prompt. */
function quietStrips(blocks: Block[], openingStrip: number): Set<number> {
  const quiet = new Set<number>();
  let lastCta = openingStrip;
  blocks.forEach((b, i) => {
    if (b.type !== "cta" || i === openingStrip) return;
    if ((lastCta >= 0 && i - lastCta <= 2) || i >= blocks.length - 2) quiet.add(i);
    lastCta = i;
  });
  return quiet;
}

function debugFor(archetype: RedesignArchetype, blocks: Block[]) {
  return {
    archetype: `REDESIGN_${archetype.toUpperCase()}`,
    renderer: "RedesignPageRenderer",
    rawFallback: false,
    structuredBlockCount: blocks.length,
    semanticBlockTypes: blocks.map((b) => b.type).join(","),
    rawHtmlBlocks: 0,
  };
}

function ContactMethod({ href, icon, label, value, external = false }: { href: string; icon: React.ReactNode; label: string; value: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-brand-300 hover:shadow-soft"
    >
      {icon}
      <span className="min-w-0">
        <span className="block text-sm text-neutral-500">{label}</span>
        <span className="block text-lg font-bold text-brand-800">{value}</span>
      </span>
    </a>
  );
}

function ContactView({ record, model }: { record: ContentRecord; model: PageModel }) {
  const intro = model.blocks.find((b) => b.type === "cta") as Extract<Block, { type: "cta" }> | undefined;
  const maps = model.blocks.filter((b) => b.type === "map") as Extract<Block, { type: "map" }>[];
  const office = maps.find((m) => m.body.length && m.body.every((r) => r.kind === "p") && m.body.length === 1);
  const follow = model.blocks.find((b) => b.type === "prose" && !b.body.length && b.heading) as Extract<Block, { type: "prose" }> | undefined;
  const handled = new Set<Block>([intro, office, follow].filter(Boolean) as Block[]);
  const rest = model.blocks.filter((b) => !handled.has(b));
  const breadcrumbs = breadcrumbsForContent(record);

  return (
    <InternalPageShell debug={debugFor("contact", model.blocks)}>
      <RedesignHero hero={model.hero} breadcrumbs={breadcrumbs} compact aside="none" />
      <section id="contact" className="bg-gradient-to-b from-brand-50 via-white to-white py-12 sm:py-16 lg:py-20" data-section-type="contact-main" data-final-conversion>
        <Container width="standard">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
            <div className="min-w-0">
              {intro?.heading ? (
                <ScrollReveal variant="heading">
                  <h2 className="text-balance text-[1.6rem] font-bold leading-snug text-brand-800 sm:text-3xl">{intro.heading.text}</h2>
                  <span className="mt-4 block h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
                </ScrollReveal>
              ) : null}
              {intro?.text.length ? (
                <ScrollReveal variant="subtle" className="mt-6">
                  <RichContent blocks={intro.text} />
                </ScrollReveal>
              ) : null}
              <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
                <ContactMethod
                  href={`tel:${PHONE_TEL}`}
                  label="טלפון"
                  value={<span dir="ltr">{PHONE_DISPLAY}</span>}
                  icon={
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-800 text-accent-300">
                      <PhoneHandsetIcon className="h-5 w-5" />
                    </span>
                  }
                />
                <ContactMethod
                  href={whatsAppUrl()}
                  external
                  label="הודעה מהירה"
                  value="WhatsApp"
                  icon={
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                      <WhatsAppIcon className="h-5 w-5" />
                    </span>
                  }
                />
              </div>
              {office ? (
                <div className="mt-3.5 flex items-start gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-500">כתובת</p>
                    <RichContent blocks={office.body} size="sm" className="[&_p]:text-lg [&_p]:font-bold [&_p]:text-brand-800" />
                  </div>
                </div>
              ) : null}
              {follow?.heading ? (
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <h3 className="text-base font-bold text-brand-800">{follow.heading.text}</h3>
                  <div className="rounded-full bg-brand-900 px-3 py-2">
                    <FooterSocialIcons />
                  </div>
                </div>
              ) : null}
            </div>
            <ScrollReveal variant="subtle" className="min-w-0">
              <div className="rounded-[26px] border border-brand-100 bg-white p-5 shadow-elevated sm:p-8">
                <p className="text-xl font-bold text-brand-800">טופס יצירת קשר</p>
                <p className="mb-6 mt-1 text-sm text-neutral-500">השאירו פרטים ונחזור אליכם בהקדם.</p>
                <QuoteForm variant="section" showEmail />
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>
      {office ? (
        <MapView block={{ ...office, body: [] }} tone="white" />
      ) : null}
      {assignTones(normalizeHeadingLevels(rest)).map((t, i) => renderBlock(t.tone === "white" && i === 0 ? { ...t, tone: "mist" } : t, i))}
    </InternalPageShell>
  );
}

export function RedesignPageRenderer({ record }: { record: ContentRecord }) {
  const featured = resolveSourceImageSrc(record.featuredImage);
  const model = composePage({ title: record.title, contentHtml: record.contentHtml, featuredImage: featured });
  const archetype = resolveRedesignArchetype(record.path, model);

  if (archetype === "contact") {
    return (
      <>
        <ContactView record={record} model={model} />
        <PopupPageRegistrar record={record} archetype="contact" />
      </>
    );
  }

  const breadcrumbs = breadcrumbsForContent(record);
  const trailing = foldTrailingCta(model);
  const folded = foldDuplicateConversionPrompt(trailing.blocks, trailing.conversion);
  const { conversion } = folded;
  const heroFormEnabled = shouldShowHeroForm(archetype, record.path);
  const deduped = dropImmediatePostHeroCta(model.hero, folded.blocks, { heroForm: heroFormEnabled });
  let { hero } = deduped;
  if (heroFormEnabled) {
    hero = { ...hero, buttons: normalizeHeroButtonsWithForm(hero.buttons) };
  }
  const blocks = normalizeHeadingLevels(dropRepeatedFaqImage(hero, deduped.blocks));
  const quiet = quietStrips(blocks, -1);
  const isUtility = archetype === "utility" || archetype === "legal";
  const showConversion = archetype !== "utility";
  const formCopy = heroFormEnabled ? heroFormCopy(archetype) : null;

  return (
    <InternalPageShell debug={debugFor(archetype, blocks)}>
      <RedesignHero
        hero={hero}
        breadcrumbs={breadcrumbs}
        compact={isUtility}
        aside={heroFormEnabled ? "form" : isUtility ? "none" : "auto"}
        heroForm={
          formCopy
            ? {
                ...formCopy,
                pagePath: record.path,
                pageTitle: record.title,
                pageType: archetype,
                serviceContext: record.path,
              }
            : null
        }
      />
      {assignTones(blocks).map((t, i) => renderBlock(t, i, archetype === "legal", quiet.has(i)))}
      {record.path === "/accessibility-statement" ? <AccessibilityStatementAddendum /> : null}
      {showConversion ? <RedesignConversion title={conversion.title} text={conversion.text} body={conversion.body} /> : null}
      <PopupPageRegistrar record={record} archetype={archetype} />
    </InternalPageShell>
  );
}
