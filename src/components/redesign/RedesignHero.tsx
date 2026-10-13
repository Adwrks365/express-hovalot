import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/content/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { HeroQuickQuoteForm } from "@/components/redesign/HeroQuickQuoteForm";
import { CtaButtonRow } from "@/components/redesign/CtaButtons";
import { InlineHtml } from "@/components/redesign/RichContent";
import type { HeroModel } from "@/lib/redesign/blocks";

function HeroBackdrop({
  background,
  slides = [],
  fallbackImage,
}: {
  background: HeroModel["background"];
  slides?: HeroModel["backgroundSlides"];
  fallbackImage?: HeroModel["image"];
}) {
  const bg = background ?? (fallbackImage ? { src: fallbackImage.src, alt: fallbackImage.alt, width: fallbackImage.width, height: fallbackImage.height } : null);
  if (bg) {
    const extra = slides ?? [];
    return (
      <div className="absolute inset-0" aria-hidden="true">
        <Image src={bg.src} alt="" fill preload className="object-cover object-center" sizes="100vw" />
        {extra.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt=""
            fill
            className="hero-slide object-cover object-center"
            style={{ animationDelay: `${(i + 1) * 6}s`, animationDuration: `${(extra.length + 1) * 6}s` }}
            sizes="100vw"
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(0,40,10,0.94)_0%,rgba(0,40,10,0.82)_45%,rgba(0,40,10,0.55)_100%)]" />
      </div>
    );
  }
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a2a0d_0%,#003405_45%,#13330E_100%)]" />
      <div className="absolute -top-32 start-[-8rem] h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -bottom-40 end-[-6rem] h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:22px_22px]" />
    </div>
  );
}

export type ContentHeroFormProps = {
  heading: string;
  supporting: string;
  pagePath: string;
  pageTitle: string;
  pageType: string;
  serviceContext?: string;
};

export function RedesignHero({
  hero,
  breadcrumbs,
  compact = false,
  aside = "auto",
  heroForm,
}: {
  hero: HeroModel;
  breadcrumbs: BreadcrumbItem[];
  compact?: boolean;
  /** auto: optional media column; form: quick quote panel; media: image column only; none: content only */
  aside?: "auto" | "media" | "none" | "form";
  heroForm?: ContentHeroFormProps | null;
}) {
  const formMode = aside === "form" && heroForm;
  const showMediaAside = !formMode && (aside === "auto" || aside === "media") && Boolean(hero.image);
  const showFormAside = Boolean(formMode);
  const showAside = showMediaAside || showFormAside;
  const [primarySubtitle, ...moreSubtitles] = hero.subtitles;
  const buttons = hero.buttons;

  const backdropFallback = formMode && !hero.background ? hero.image : null;

  return (
    <section className="relative overflow-hidden bg-brand-900 text-white" data-redesign-hero>
      <HeroBackdrop background={hero.background} slides={hero.backgroundSlides} fallbackImage={backdropFallback} />
      <Container width="standard" className={`relative ${compact ? "py-10 sm:py-12 lg:py-14" : "py-11 sm:py-14 lg:py-[4.5rem]"}`}>
        <div
          className={`grid items-center gap-8 lg:gap-10 ${showAside ? "lg:grid-cols-[minmax(0,1.85fr)_minmax(320px,380px)]" : ""}`}
        >
          <div className="min-w-0 text-start">
            <Breadcrumbs items={breadcrumbs} variant="onDark" />
            {hero.icon ? (
              <div className="mb-4 h-14 w-14 rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15">
                <Image src={hero.icon.src} alt={hero.icon.alt} width={56} height={56} className="h-full w-full object-contain" />
              </div>
            ) : null}
            {hero.eyebrow ? (
              <p className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-sm font-semibold text-accent-300">
                {hero.eyebrow}
              </p>
            ) : null}
            <h1 className="max-w-[46rem] text-balance text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-[2.5rem] lg:text-[2.875rem]">
              {hero.title}
            </h1>
            <span className="mt-5 block h-1 w-16 rounded-full bg-accent" aria-hidden="true" />
            {primarySubtitle ? (
              <p className="mt-5 max-w-[44rem] text-lg font-semibold leading-relaxed text-white/95 sm:text-xl">{primarySubtitle}</p>
            ) : null}
            {moreSubtitles.map((s) => (
              <p key={s} className="mt-3 max-w-[44rem] text-base leading-relaxed text-white/85 sm:text-lg">
                {s}
              </p>
            ))}
            {hero.lead.map((html, i) => (
              <InlineHtml
                key={i}
                as="p"
                value={html}
                className="mt-4 block max-w-[44rem] text-base leading-[1.8] text-white/80 sm:text-[1.0625rem] [&_a]:text-accent-300 [&_a]:underline [&_strong]:text-white"
              />
            ))}
            <CtaButtonRow buttons={buttons} surface="dark" className="mt-7" />
            {hero.badges.length ? (
              <ul className="mt-8 flex flex-wrap items-end justify-center gap-4 sm:justify-start sm:gap-6">
                {hero.badges.map((b) => {
                  const img = (
                    <Image src={b.src} alt={b.alt} width={b.width ?? 488} height={b.height ?? 652} className="h-auto w-full drop-shadow-lg" sizes="88px" />
                  );
                  return (
                    <li key={b.src} className="w-[4.75rem] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none sm:w-[5.5rem]">
                      {b.href ? (
                        <Link href={b.href} className="block">
                          {img}
                        </Link>
                      ) : (
                        img
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
          {showFormAside && heroForm ? (
            <div className="w-full lg:justify-self-start">
              <HeroQuickQuoteForm {...heroForm} />
            </div>
          ) : null}
          {showMediaAside && hero.image ? (
            <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
              <div className="absolute -inset-3 -z-0 rounded-[28px] bg-accent/20 blur-2xl" aria-hidden="true" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-brand-800 ring-1 ring-white/20 shadow-elevated">
                <Image src={hero.image.src} alt={hero.image.alt || hero.title} fill preload className="object-cover" sizes="(max-width: 1024px) 92vw, 380px" />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/** Shared internal content Hero — alias for redesign pages. */
export const ContentHero = RedesignHero;
