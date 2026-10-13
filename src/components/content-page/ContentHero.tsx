import Image from "next/image";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/content/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { heroPad } from "@/lib/layout";

/**
 * Compact internal hero — homepage palette, distinct from site header.
 */
export function ContentHero({
  title,
  breadcrumbs,
  intro,
  image,
  imageAlt,
  showQuoteCta = true,
  variant = "service",
}: {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  intro?: string | null;
  image?: string | null;
  imageAlt?: string;
  showQuoteCta?: boolean;
  variant?: "service" | "standard" | "editorial";
}) {
  const gradient =
    variant === "editorial"
      ? "bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900"
      : "bg-gradient-to-br from-[#1a4d38] via-brand-800 to-brand-950";

  return (
    <section
      className={`relative overflow-hidden border-b border-white/10 text-white ${gradient}`}
      data-page-hero
      data-content-hero
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(212,175,55,0.16),transparent_52%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-accent via-accent/70 to-transparent"
        aria-hidden="true"
      />
      <Container className={`relative ${heroPad.standard}`}>
        <Breadcrumbs items={breadcrumbs} variant="onDark" />
        <div
          className={
            image
              ? "mt-4 grid items-center gap-7 sm:mt-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,44%)] lg:gap-10 xl:gap-12"
              : "mt-4 max-w-3xl sm:mt-5"
          }
        >
          <div className="min-w-0 text-start">
            <h1 className="text-balance text-2xl font-bold leading-[1.18] text-white sm:text-[1.75rem] lg:text-[2.125rem]">
              {title}
            </h1>
            {intro ? (
              <p className="mt-3 max-w-2xl text-sm leading-[1.82] text-white/90 sm:mt-4 sm:text-base lg:max-w-xl">
                {intro}
              </p>
            ) : null}
            {showQuoteCta ? (
              <div className="mt-5 sm:mt-6">
                <Button
                  href="/הצעת-מחיר/"
                  variant="gold"
                  className="min-h-[44px] w-full rounded-[14px] sm:w-auto sm:min-w-[11rem]"
                >
                  הצעת מחיר
                </Button>
              </div>
            ) : null}
          </div>
          {image ? (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[340px] overflow-hidden rounded-2xl border border-white/25 bg-white/5 p-1.5 shadow-elevated sm:max-w-[380px] lg:mx-0 lg:max-w-none lg:min-h-[280px] lg:aspect-[5/4]">
              <div className="relative h-full min-h-[200px] w-full overflow-hidden rounded-[14px] sm:min-h-[220px] lg:min-h-[260px]">
                <Image
                  src={image}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 320px, 420px"
                  priority
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
