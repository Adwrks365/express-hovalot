import Image from "next/image";
import { homepageHero } from "@/content/homepage-content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { HeroBenefitBadges } from "@/components/home/HeroBenefitBadges";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/constants";

const heroActionClass =
  "w-full min-h-[44px] rounded-[14px] sm:w-auto sm:min-w-[10.5rem] sm:flex-1 sm:flex-initial lg:min-w-[11rem]";

export function HeroSection() {
  return (
    <section className="relative min-h-[420px] overflow-hidden bg-brand-800 lg:min-h-[460px]" data-home-hero>
      <div className="absolute inset-0">
        <Image
          src={homepageHero.heroImage}
          alt="משאית הובלות אקספרס בירושלים"
          fill
          priority
          fetchPriority="high"
          className="hidden object-cover object-[70%_center] lg:block"
          sizes="100vw"
        />
        <Image
          src={homepageHero.heroImageMobile}
          alt=""
          fill
          priority
          fetchPriority="high"
          aria-hidden="true"
          className="object-cover object-[42%_68%] lg:hidden"
          sizes="100vw"
        />
        <div className="absolute inset-0 hidden bg-hero-gradient lg:block" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,45,18,0.66)_0%,rgba(0,45,18,0.34)_42%,rgba(0,45,18,0.28)_62%,rgba(0,45,18,0.52)_100%)] lg:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_95%_50%_at_50%_18%,rgba(0,45,18,0.45)_0%,transparent_70%)] lg:hidden"
          aria-hidden="true"
        />
      </div>

      <Container className="relative py-7 lg:grid lg:grid-cols-[1fr_275px] lg:items-center lg:gap-8 lg:py-9">
        <div
          data-hero-content
          className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center lg:max-w-none lg:items-center lg:pe-2"
        >
          <Heading
            as="h2"
            role="hero-seo"
            tone="onDark"
            className="mb-3 text-[15px] font-bold leading-snug text-accent sm:text-base lg:text-base"
          >
            {homepageHero.seoHeadline}
          </Heading>
          <Heading
            as="h1"
            role="hero-display"
            tone="onDark"
            className="mb-4 max-w-[340px] !text-[2.25rem] font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:max-w-[680px] sm:!text-[2.375rem] lg:max-w-[720px] lg:!text-[3.25rem] lg:!leading-[1.06]"
          >
            {homepageHero.title}
          </Heading>
          <Heading
            as="h2"
            role="hero-section-line"
            tone="onDark"
            className="mb-4 max-w-[340px] text-xl font-semibold leading-snug text-white/95 sm:max-w-[680px] sm:text-[1.375rem] lg:max-w-[720px] lg:!text-[1.625rem]"
          >
            {homepageHero.servicesLine}
          </Heading>
          <p className="mb-4 hidden max-w-[340px] text-base leading-[1.75] text-white/90 sm:max-w-[680px] md:block sm:text-[17px] sm:leading-[1.78] lg:max-w-[680px]">
            {homepageHero.subtitle}
          </p>
          <p className="mb-8 max-w-[340px] text-[15px] leading-relaxed text-white/75 sm:max-w-[680px] lg:max-w-[680px]">
            {homepageHero.specialties}
          </p>

          <div className="mb-8 w-full max-w-lg sm:max-w-xl">
            <HeroBenefitBadges benefits={homepageHero.benefits} />
          </div>

          <div className="w-full max-w-md">
            <p className="mb-3 text-xs text-white/55 sm:text-sm">{homepageHero.phoneCtaLabel}</p>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button href={homepageHero.primaryCtaHref} variant="gold" className={heroActionClass}>
                {homepageHero.primaryCtaLabel}
              </Button>
              <Button
                href={`tel:${PHONE_TEL}`}
                variant="heroOutline"
                className={heroActionClass}
                aria-label={`התקשרו לאקספרס הובלות לקבלת הצעת מחיר: ${PHONE_DISPLAY}`}
              >
                <PhoneHandsetIcon className="h-4 w-4 shrink-0" />
                <span dir="ltr" className="font-bold tracking-wide">
                  {PHONE_DISPLAY}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full rounded-xl bg-white/96 p-2.5 shadow-sm ring-1 ring-white/80 lg:mt-0 lg:w-[275px] lg:justify-self-start lg:p-3">
          <Heading as="h3" role="subsection-h3" tone="onLight" className="!text-brand-800 text-sm leading-snug">
            {homepageHero.formTitle}
          </Heading>
          <p className="mt-0.5 text-xs text-neutral-500">{homepageHero.formIntro}</p>
          <div className="mt-1">
            <QuoteForm variant="hero" compact heroDense showEmail={false} labelMode="placeholder" />
          </div>
        </div>
      </Container>
    </section>
  );
}
