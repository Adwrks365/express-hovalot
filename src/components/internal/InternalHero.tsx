import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/content/Breadcrumbs";
import { heroPad } from "@/lib/layout";

export function InternalHero({
  title,
  breadcrumbs,
  intro,
  image,
  imageAlt,
  backgroundImage,
  variant = "service",
}: {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  intro?: string | null;
  image?: string | null;
  imageAlt?: string;
  backgroundImage?: string | null;
  variant?: "service" | "standard";
}) {
  const gradient =
    variant === "standard"
      ? "bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900"
      : "bg-gradient-to-br from-[#1a4d38] via-brand-800 to-brand-950";

  return (
    <section
      className={`relative overflow-hidden border-b border-neutral-200/15 text-white ${gradient}`}
      data-page-hero
    >
      {backgroundImage ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900/88 via-brand-900/82 to-brand-950/94"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(212,175,55,0.18),transparent_55%)]"
          aria-hidden="true"
        />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-accent via-accent/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
        aria-hidden="true"
      />
      <Container className={`relative ${heroPad.standard}`}>
        <Breadcrumbs items={breadcrumbs} variant="onDark" />
        <div
          className={
            image
              ? "mt-4 grid items-center gap-6 sm:mt-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_280px]"
              : "mt-4 max-w-3xl sm:mt-5"
          }
        >
          <div className="min-w-0">
            <h1 className="text-balance text-2xl font-bold leading-[1.2] text-white sm:text-3xl lg:text-[2.125rem]">
              {title}
            </h1>
            {intro ? (
              <p className="mt-3 max-w-2xl text-sm leading-[1.8] text-white/92 sm:mt-4 sm:text-base lg:text-lg">
                {intro}
              </p>
            ) : null}
          </div>
          {image ? (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[240px] overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-1 shadow-elevated sm:max-w-[260px] lg:mx-0 lg:max-w-none">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src={image}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 240px, 280px"
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
