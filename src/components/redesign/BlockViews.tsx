import Image from "next/image";
import Link from "next/link";
import { CalculatorSection } from "@/components/home/CalculatorSection";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CtaButtonLink, CtaButtonRow } from "@/components/redesign/CtaButtons";
import { RichContent } from "@/components/redesign/RichContent";
import { RichFaq } from "@/components/redesign/RichFaq";
import { RedesignSection, SectionHeader, type SectionTone } from "@/components/redesign/Section";
import { VideoFacade } from "@/components/redesign/VideoFacade";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";
import { filterLaunchSitemapHref } from "@/lib/launch-sitemap";
import type { Block, Card, CtaButton } from "@/lib/redesign/blocks";
import { blocksText } from "@/lib/redesign/compose";
import type { ContentLink, SourceImage } from "@/lib/redesign/types";

type B<T extends Block["type"]> = Extract<Block, { type: T }>;

const STANDARD_CTAS: CtaButton[] = [
  { label: "השאירו פרטים", href: "#contact", kind: "contact" },
  { label: PHONE_DISPLAY, href: `tel:${PHONE_TEL}`, kind: "phone" },
  { label: "WhatsApp", href: whatsAppUrl(), kind: "whatsapp" },
];

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

function SmartLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (isInternal(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  );
}

function MaybeLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <SmartLink href={href} className="block">
      {children}
    </SmartLink>
  );
}

function ImageFrame({ image, sizes, className = "", aspect = "aspect-[4/3]" }: { image: SourceImage; sizes: string; className?: string; aspect?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[22px] bg-brand-50 shadow-elevated ring-1 ring-black/5 ${aspect} ${className}`.trim()}>
      <Image src={image.src} alt={image.alt} fill className="object-cover" sizes={sizes} />
    </div>
  );
}

export function LinkChips({ links, tone = "white" }: { links: ContentLink[]; tone?: SectionTone }) {
  if (!links.length) return null;
  const dark = tone === "dark";
  return (
    <ul className="flex flex-wrap gap-2.5">
      {links.map((l) => (
        <li key={`${l.href}-${l.label}`}>
          <SmartLink
            href={l.href}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors sm:text-[0.95rem] ${dark ? "border-white/20 bg-white/5 text-white hover:border-accent-300 hover:text-accent-300" : "border-brand-200 bg-white text-brand-800 shadow-card hover:border-brand-500 hover:bg-brand-50"}`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dark ? "bg-accent-300" : "bg-accent"}`} aria-hidden="true" />
            {l.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

function Gallery({ images }: { images: SourceImage[] }) {
  if (!images.length) return null;
  const cols = images.length === 1 ? "" : images.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-5 ${cols}`}>
      {images.map((img, i) => (
        <ScrollReveal key={img.src} variant="image" delayMs={i * 60}>
          <MaybeLink href={img.href}>
            {images.length === 1 ? (
              <div className="mx-auto max-w-[52rem] overflow-hidden rounded-[22px] bg-brand-50 shadow-elevated">
                <Image src={img.src} alt={img.alt} width={img.width ?? 1200} height={img.height ?? 800} className="h-auto w-full" sizes="(max-width: 1024px) 92vw, 832px" />
              </div>
            ) : (
              <ImageFrame image={img} sizes="(max-width: 640px) 92vw, 33vw" />
            )}
          </MaybeLink>
        </ScrollReveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ prose */

export function ProseView({ block, tone, stacked = false }: { block: B<"prose">; tone: SectionTone; stacked?: boolean }) {
  const len = blocksText(block.body).length;
  const hasHead = Boolean(block.heading || block.eyebrow);
  const longHeading = (block.heading?.text.length ?? 0) > 110;
  const sideLayout = !stacked && !longHeading && hasHead && len > 520 && !block.gallery.length;
  const dark = tone === "dark";

  if (sideLayout) {
    return (
      <RedesignSection tone={tone} kind="prose">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone={tone} />
            {block.buttons.length ? <CtaButtonRow buttons={block.buttons} surface={dark ? "dark" : "light"} className="mt-7" /> : null}
          </div>
          <ScrollReveal variant="subtle" className="min-w-0">
            <div className={`rounded-[22px] p-0 sm:p-0 ${dark ? "" : "lg:border-s lg:border-brand-100 lg:ps-12"}`}>
              <RichContent blocks={block.body} tone={dark ? "dark" : "light"} />
              {block.links.length ? (
                <div className="mt-7">
                  <LinkChips links={block.links} tone={tone} />
                </div>
              ) : null}
            </div>
          </ScrollReveal>
        </div>
      </RedesignSection>
    );
  }

  return (
    <RedesignSection tone={tone} kind="prose" pad={len < 200 && !block.gallery.length ? "compact" : "normal"}>
      <div className="mx-auto max-w-[56rem]">
        <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone={tone} align={len < 360 ? "center" : "start"} className="mb-6" />
        {block.body.length ? (
          <ScrollReveal variant="subtle">
            {len < 360 && hasHead && block.body.every((b) => b.kind === "list") ? (
              <div className="mx-auto w-fit max-w-full">
                <RichContent blocks={block.body} tone={dark ? "dark" : "light"} />
              </div>
            ) : (
              <RichContent blocks={block.body} tone={dark ? "dark" : "light"} className={len < 360 && hasHead ? "text-center" : ""} />
            )}
          </ScrollReveal>
        ) : null}
        {block.links.length ? (
          <div className={`mt-7 ${len < 360 ? "flex justify-center" : ""}`}>
            <LinkChips links={block.links} tone={tone} />
          </div>
        ) : null}
        {block.buttons.length ? (
          <CtaButtonRow buttons={block.buttons} surface={dark ? "dark" : "light"} className="mt-7" align={len < 360 ? "center" : "start"} />
        ) : null}
      </div>
      {block.gallery.length ? (
        <div className="mt-9">
          <Gallery images={block.gallery} />
        </div>
      ) : null}
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ split */

function FeatureList({ cards }: { cards: Card[] }) {
  return (
    <ul className="mt-7 grid gap-3.5 sm:grid-cols-2">
      {cards.map((c, i) => (
        <ScrollReveal key={`${c.title}-${i}`} as="li" variant="card" delayMs={i * 50} className="flex gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M7.7 13.3 4.4 10l-1.1 1.1 4.4 4.4 9.4-9.4-1.1-1.1z" />
            </svg>
          </span>
          <div className="min-w-0">
            <CardTitle card={c} className="text-base font-bold text-brand-800" />
            <RichContent blocks={c.body} size="sm" className="mt-1.5" />
          </div>
        </ScrollReveal>
      ))}
    </ul>
  );
}

export function SplitView({ block, tone }: { block: B<"split">; tone: SectionTone }) {
  const dark = tone === "dark";
  return (
    <RedesignSection tone={tone} kind="image-text">
      <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal variant={block.imageFirst ? "slide-start" : "slide-end"} className={`min-w-0 ${block.imageFirst ? "" : "lg:order-2"}`}>
          <div className="relative mx-auto max-w-[560px]">
            <div className="absolute -bottom-4 -start-4 hidden h-2/3 w-2/3 rounded-[26px] bg-accent/25 sm:block" aria-hidden="true" />
            <MaybeLink href={block.image.href}>
              <div className="relative overflow-hidden rounded-[24px] bg-brand-50 shadow-elevated ring-1 ring-black/5">
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  width={block.image.width ?? 1000}
                  height={block.image.height ?? 750}
                  className="h-auto max-h-[520px] w-full object-cover"
                  sizes="(max-width: 1024px) 92vw, 560px"
                />
              </div>
            </MaybeLink>
          </div>
        </ScrollReveal>
        <div className="min-w-0">
          <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone={tone} className="mb-6" />
          {block.body.length ? (
            <ScrollReveal variant="subtle">
              <RichContent blocks={block.body} tone={dark ? "dark" : "light"} />
            </ScrollReveal>
          ) : null}
          {block.features.length ? <FeatureList cards={block.features} /> : null}
          <CtaButtonRow buttons={block.buttons} surface={dark ? "dark" : "light"} className="mt-7" />
        </div>
      </div>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ cards */

function CardTitle({ card, className }: { card: Card; className: string }) {
  const Tag = card.titleAs ? (`h${card.titleAs}` as "h2" | "h3" | "h4") : card.titleLevel <= 3 ? "h3" : "h4";
  if (card.href) {
    return (
      <Tag className={className}>
        <SmartLink href={card.href} className="transition-colors hover:text-brand-500">
          {card.title}
        </SmartLink>
      </Tag>
    );
  }
  return <Tag className={className}>{card.title}</Tag>;
}

function CardActions({ card }: { card: Card }) {
  const actions = card.actions ?? [];
  if (!actions.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {actions.map((a) =>
        a.kind === "link" ? (
          <SmartLink key={`${a.href}-${a.label}`} href={a.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-colors hover:text-brand-800">
            {a.label}
            <span aria-hidden="true">←</span>
          </SmartLink>
        ) : (
          <CtaButtonLink key={`${a.href}-${a.label}`} button={a} surface="light" />
        ),
      )}
    </div>
  );
}

function gridCols(n: number) {
  if (n <= 1) return "max-w-xl mx-auto";
  if (n === 2) return "sm:grid-cols-2 max-w-5xl mx-auto";
  if (n === 4) return "sm:grid-cols-2 xl:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

function ImageCard({ card, index }: { card: Card; index: number }) {
  return (
    <ScrollReveal as="article" variant="card" delayMs={(index % 3) * 70} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-neutral-200/70 bg-white shadow-card transition-shadow duration-200 hover:shadow-elevated">
      {card.image ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
          <Image src={card.image.src} alt={card.image.alt} fill className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px" />
          {card.badge ? (
            <div className="absolute bottom-3 start-3 h-14 w-14 rounded-2xl bg-white/95 p-2 shadow-soft">
              <Image src={card.badge.src} alt={card.badge.alt} width={56} height={56} className="h-full w-full object-contain" />
            </div>
          ) : null}
        </div>
      ) : card.badge ? (
        <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100/70">
          <div className="h-24 w-24 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-brand-100">
            <Image src={card.badge.src} alt={card.badge.alt} width={96} height={96} className="h-full w-full object-contain" />
          </div>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <CardTitle card={card} className="text-lg font-bold leading-snug text-brand-800 sm:text-xl" />
        <RichContent blocks={card.body} size="sm" className="mt-3 flex-1" />
        <CardActions card={card} />
      </div>
    </ScrollReveal>
  );
}

const iconMark = (card: Card) => card.badge ?? (card.image && card.image.width && card.image.width <= 200 ? card.image : null);

/** Short benefit cards (no photo, no actions) read best centered. */
function centeredIconGrid(cards: Card[]): boolean {
  return cards.length > 1 && cards.every((c) => !(c.image && !iconMark(c)) && !c.actions?.length && c.body.every((b) => b.kind === "p") && blocksText(c.body).length <= 220);
}

function IconCard({ card, index, numbered, centered = false }: { card: Card; index: number; numbered: boolean; centered?: boolean }) {
  const mark = iconMark(card);
  const photo = !mark && card.image ? card.image : null;
  const iconAlign = centered ? "mx-auto" : "";
  return (
    <ScrollReveal as="article" variant="card" delayMs={(index % 4) * 60} className={`relative flex h-full flex-col rounded-[22px] border border-brand-100 bg-white p-5 shadow-card transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-soft sm:p-6 ${centered ? "items-center text-center" : ""}`}>
      <span className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-accent" aria-hidden="true" />
      {photo ? (
        <div className="relative -mx-1 mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-brand-50">
          <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 640px) 92vw, 360px" />
        </div>
      ) : mark ? (
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 p-2.5 ring-1 ring-brand-100 ${iconAlign}`}>
          <Image src={mark.src} alt={mark.alt} width={48} height={48} className="h-full w-full object-contain" />
        </div>
      ) : (
        <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-800 text-sm font-bold text-accent-300 ${iconAlign}`} aria-hidden="true">
          {numbered ? String(index + 1).padStart(2, "0") : "✓"}
        </span>
      )}
      <CardTitle card={card} className="text-lg font-bold leading-snug text-brand-800" />
      <RichContent blocks={card.body} size="sm" className={`mt-2.5 flex-1 ${centered ? "[&_p]:text-center" : ""}`} />
      <CardActions card={card} />
    </ScrollReveal>
  );
}

export function CardsView({ block, tone }: { block: B<"cards">; tone: SectionTone }) {
  const dark = tone === "dark";
  const introLen = blocksText(block.intro).length;
  const centered = block.variant !== "image" && centeredIconGrid(block.cards);
  return (
    <RedesignSection tone={tone} kind={`cards-${block.variant}`}>
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone={tone} align={introLen > 500 ? "start" : "center"} className="mb-4" />
      {block.intro.length ? (
        <ScrollReveal variant="subtle" className={`max-w-[52rem] ${introLen > 500 ? "" : "mx-auto text-center"}`}>
          <RichContent blocks={block.intro} tone={dark ? "dark" : "light"} />
        </ScrollReveal>
      ) : null}
      <div className={`mt-10 grid gap-5 sm:gap-6 ${gridCols(block.cards.length)}`}>
        {block.cards.map((c, i) =>
          block.variant === "image" ? (
            <ImageCard key={`${c.title}-${i}`} card={c} index={i} />
          ) : (
            <IconCard key={`${c.title}-${i}`} card={c} index={i} numbered={block.variant === "feature" && block.cards.length > 2} centered={centered} />
          ),
        )}
      </div>
      <CtaButtonRow buttons={block.buttons} surface={dark ? "dark" : "light"} className="mt-10" align="center" />
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ stats */

export function StatsView({ block }: { block: B<"stats"> }) {
  const items = block.items.filter((item) => /^\d/.test(item.value));
  if (!items.length) return null;
  return (
    <RedesignSection tone="dark" kind="stats" pad="compact">
      <div className="absolute -top-24 end-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone="dark" align="center" className="mb-4" />
      {block.intro.length ? (
        <ScrollReveal variant="subtle" className="mx-auto max-w-[44rem] text-center">
          <RichContent blocks={block.intro} tone="dark" />
        </ScrollReveal>
      ) : null}
      <dl className={`grid grid-cols-2 gap-4 sm:gap-5 ${block.heading || block.intro.length ? "mt-9" : ""} ${items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : ""}`}>
        {items.map((item, i) => (
          <ScrollReveal key={`${item.label}-${i}`} variant="card" delayMs={i * 70} className="flex flex-col items-center rounded-[20px] border border-white/10 bg-white/[0.06] px-3 py-6 text-center sm:px-5" data-stat-label={item.label} data-stat-value={item.value}>
            <dt className="order-2 mt-2 text-sm font-semibold text-white/90 sm:text-base">{item.label}</dt>
            <dd className="order-1 text-[2.1rem] font-extrabold leading-none text-accent-300 sm:text-[2.6rem]" dir="ltr">
              {item.prefix === "%" ? (
                <AnimatedCounter value={item.value} suffix="%" />
              ) : (
                <AnimatedCounter value={item.value} prefix={item.prefix} suffix={item.suffix} />
              )}
            </dd>
            {item.description ? (
              <dd className="order-3 mt-2 text-[0.85rem] leading-relaxed text-white/70 sm:text-sm" dangerouslySetInnerHTML={{ __html: item.description }} />
            ) : null}
          </ScrollReveal>
        ))}
      </dl>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ faq */

export function FaqView({ block, tone, wide = false }: { block: B<"faq">; tone: SectionTone; wide?: boolean }) {
  const items = block.items.map((it) => ({ question: it.question, answer: <RichContent blocks={it.answer} size="sm" /> }));
  const withImage = Boolean(block.image) && !wide;
  return (
    <RedesignSection tone={tone === "dark" ? "white" : tone} kind="faq" width={withImage ? "standard" : "content"}>
      <div className={withImage ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:gap-14" : ""}>
        <div className="min-w-0">
          <SectionHeader eyebrow={block.eyebrow} heading={block.heading} align={withImage ? "start" : "center"} className="mb-4" />
          {block.intro.length ? (
            <ScrollReveal variant="subtle" className={withImage ? "" : "mx-auto max-w-[46rem] text-center"}>
              <RichContent blocks={block.intro} />
            </ScrollReveal>
          ) : null}
          <ScrollReveal variant="subtle" className="mt-8">
            <RichFaq items={items} />
          </ScrollReveal>
          <CtaButtonRow buttons={block.buttons} surface="light" className="mt-8" align={withImage ? "start" : "center"} />
        </div>
        {withImage && block.image ? (
          <ScrollReveal variant="image" className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <ImageFrame image={block.image} aspect="aspect-[4/5]" sizes="400px" />
          </ScrollReveal>
        ) : null}
      </div>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ cta strip */

/** Keeps phone numbers in headings on one line and left-to-right. */
function NoBreakPhones({ text }: { text: string }) {
  return (
    <>
      {text.split(/(0\d[\d-]{7,12}\d)/).map((part, i) =>
        i % 2 ? (
          <span key={i} dir="ltr" className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function CtaStripView({ block, tone, quiet = false }: { block: B<"cta">; tone: SectionTone; quiet?: boolean }) {
  const buttons = block.buttons.length ? block.buttons : STANDARD_CTAS;
  const lead = block.eyebrow ?? null;
  if (quiet) {
    return (
      <RedesignSection tone={tone === "dark" ? "white" : tone} kind="cta-strip" pad="compact">
        <div className="flex flex-col items-center gap-5 border-y border-brand-100 py-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-start" data-cta-variant="quiet">
          <div className="min-w-0 max-w-[44rem] text-start">
            {lead ? <p className="text-sm font-bold text-brand-600 sm:text-base">{lead.text}</p> : null}
            {block.heading ? (
              <p className={`text-balance text-lg font-bold leading-snug text-brand-800 sm:text-xl ${lead ? "mt-1" : ""}`}><NoBreakPhones text={block.heading.text} /></p>
            ) : null}
            {block.text.length ? <RichContent blocks={block.text} size="sm" className={block.heading ? "mt-2" : ""} /> : null}
          </div>
          <CtaButtonRow buttons={buttons} surface="light" className="shrink-0" align="center" />
        </div>
      </RedesignSection>
    );
  }
  return (
    <RedesignSection tone={tone === "dark" ? "white" : tone} kind="cta-strip" pad="compact">
      <ScrollReveal variant="subtle">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(120deg,#003405_0%,#13330E_70%)] px-5 py-9 text-white shadow-elevated sm:px-9 sm:py-10">
          <div className="absolute -start-10 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-2xl" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-start">
            <div className="min-w-0 max-w-[44rem]">
              {lead ? <p className="text-sm font-bold text-accent-300 sm:text-base">{lead.text}</p> : null}
              {block.heading ? (
                <p className={`text-balance text-xl font-bold leading-snug sm:text-2xl ${lead ? "mt-1.5" : ""}`}><NoBreakPhones text={block.heading.text} /></p>
              ) : null}
              {block.text.length ? <RichContent blocks={block.text} tone="dark" size="sm" className={block.heading ? "mt-2" : ""} /> : null}
            </div>
            <CtaButtonRow buttons={buttons} surface="dark" className="shrink-0" align="center" />
          </div>
        </div>
      </ScrollReveal>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ logos */

export function LogosView({ block, tone }: { block: B<"logos">; tone: SectionTone }) {
  return (
    <RedesignSection tone={tone === "dark" ? "white" : tone} kind="logos" pad="compact">
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} align="center" className="mb-8" />
      <div className="-mx-4 overflow-x-clip sm:-mx-6 lg:-mx-8">
        <ClientLogoMarquee
          logos={block.logos.map((logo, i) => ({ name: logo.alt || `לקוח ${i + 1}`, path: logo.src }))}
          fade={tone === "mist" ? "mist" : "white"}
        />
      </div>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ map */

export function MapView({ block, tone }: { block: B<"map">; tone: SectionTone }) {
  const hasText = block.body.length > 0;
  return (
    <RedesignSection tone={tone === "dark" ? "white" : tone} kind="map">
      <div className={hasText ? "grid items-center gap-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14" : ""}>
        {block.heading || block.eyebrow || hasText ? (
          <div className={`min-w-0 ${hasText ? "" : "mb-8"}`}>
            <SectionHeader eyebrow={block.eyebrow} heading={block.heading} align={hasText ? "start" : "center"} className="mb-5" />
            {hasText ? <RichContent blocks={block.body} /> : null}
          </div>
        ) : null}
        <ScrollReveal variant="image" className="min-w-0">
          <div className="overflow-hidden rounded-[22px] border border-brand-100 bg-brand-50 shadow-elevated">
            <iframe src={block.src} title={block.title || block.heading?.text || "מפה"} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block h-[320px] w-full sm:h-[400px]" />
          </div>
        </ScrollReveal>
      </div>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ price list */

export function PriceListView({ block, tone }: { block: B<"priceList">; tone: SectionTone }) {
  return (
    <RedesignSection tone={tone === "dark" ? "white" : tone} kind="price-list">
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} align="center" className="mb-4" />
      {block.intro.length ? (
        <ScrollReveal variant="subtle" className="mx-auto max-w-[46rem] text-center">
          <RichContent blocks={block.intro} />
        </ScrollReveal>
      ) : null}
      <ul className="mx-auto mt-9 grid max-w-5xl gap-4 sm:grid-cols-2">
        {block.items.map((it, i) => (
          <ScrollReveal key={`${it.title}-${i}`} as="li" variant="card" delayMs={(i % 2) * 60} className="flex flex-col rounded-[20px] border border-brand-100 bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-brand-200 pb-3">
              <h3 className="text-lg font-bold text-brand-800">{it.title}</h3>
              <span className="shrink-0 text-lg font-extrabold text-brand-600">{it.price}</span>
            </div>
            {it.description ? <p className="mt-3 text-[0.95rem] leading-relaxed text-neutral-600">{it.description}</p> : null}
          </ScrollReveal>
        ))}
      </ul>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ calculator */

export function CalculatorView({ block }: { block: B<"calculator"> }) {
  const hasHead = Boolean(block.heading || block.eyebrow || block.intro.length);
  return (
    <div data-section-type="calculator">
      {hasHead ? (
        <div className="bg-brand-50/70 pt-12 sm:pt-16 lg:pt-20">
          <div className="mx-auto max-w-[52rem] px-4 sm:px-5 lg:px-8">
            <SectionHeader eyebrow={block.eyebrow} heading={block.heading} align="center" />
            {block.intro.length ? <RichContent blocks={block.intro} className="mt-4 text-center" /> : null}
          </div>
        </div>
      ) : null}
      <CalculatorSection />
    </div>
  );
}

/* ------------------------------------------------------------------ video */

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

export function VideoView({ block, tone }: { block: B<"video">; tone: SectionTone }) {
  const embed = youtubeEmbed(block.url);
  const dark = tone === "dark";
  return (
    <RedesignSection tone={tone} kind="video">
      <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="min-w-0">
          <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone={tone} className="mb-5" />
          <RichContent blocks={block.body} tone={dark ? "dark" : "light"} />
        </div>
        <ScrollReveal variant="image" className="min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-[22px] bg-brand-900 shadow-elevated ring-1 ring-black/10">
            {embed && block.poster ? (
              <VideoFacade embed={embed} title={block.heading?.text || "וידאו"} poster={block.poster} />
            ) : embed ? (
              <iframe src={embed} title={block.heading?.text || "וידאו"} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
            ) : block.poster ? (
              <a href={block.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
                <Image src={block.poster.src} alt={block.poster.alt} fill className="object-cover" sizes="(max-width: 1024px) 92vw, 700px" />
              </a>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </RedesignSection>
  );
}

/* ------------------------------------------------------------------ links / sitemap */

export function LinksView({ block, tone }: { block: B<"links">; tone: SectionTone }) {
  return (
    <RedesignSection tone={tone} kind="links" pad="compact">
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} tone={tone} align="center" className="mb-7" />
      <div className="flex justify-center">
        <LinkChips links={block.links} tone={tone} />
      </div>
    </RedesignSection>
  );
}

export function SitemapView({ block, tone }: { block: B<"sitemap">; tone: SectionTone }) {
  return (
    <RedesignSection tone={tone === "dark" ? "white" : tone} kind="sitemap">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.groups.map((g, i) => {
          const links = g.links.filter((l) => filterLaunchSitemapHref(l.href));
          if (!links.length) return null;
          return (
          <ScrollReveal key={`${g.title}-${i}`} variant="card" delayMs={(i % 3) * 60} className="rounded-[22px] border border-brand-100 bg-white p-5 shadow-card sm:p-6">
            {g.title ? <h2 className="mb-4 border-b border-brand-100 pb-3 text-lg font-bold text-brand-800">{g.title}</h2> : null}
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  <SmartLink href={l.href} className="flex items-start gap-2 text-[0.95rem] text-neutral-700 transition-colors hover:text-brand-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          );
        })}
      </div>
    </RedesignSection>
  );
}

export function ReviewsView() {
  return (
    <div data-section-type="reviews">
      <ReviewsSection />
    </div>
  );
}
