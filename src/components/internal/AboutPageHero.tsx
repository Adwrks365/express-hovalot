import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/content/Breadcrumbs";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { MEDIA } from "@/config/media-paths";
import { heroPad } from "@/lib/layout";

/** Production-aligned About hero — rich background, headline hierarchy, inline form */
export function AboutPageHero({
  title,
  breadcrumbs,
  headline,
  subtitle,
  intro,
}: {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  headline: string;
  subtitle: string;
  intro: string;
}) {
  const bgImage = MEDIA.aboutTeam;

  return (
    <section
      className="relative overflow-hidden border-b border-neutral-200/15"
      data-page-hero
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-800/90 via-brand-900/88 to-brand-950/92"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-accent via-accent/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
        aria-hidden="true"
      />
      <Container className={`relative ${heroPad.rich}`}>
        <Breadcrumbs items={breadcrumbs} variant="onDark" />
        <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-10">
          <div className="min-w-0 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent/90 sm:text-base">
              {title}
            </p>
            <h1 className="mt-2 text-balance text-2xl font-bold leading-[1.15] sm:text-3xl lg:text-[2.25rem]">
              {headline}
            </h1>
            <h2 className="mt-3 text-lg font-semibold text-white/95 sm:text-xl">{subtitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{intro}</p>
          </div>
          <aside className="rounded-2xl border border-white/15 bg-white/95 p-5 shadow-elevated backdrop-blur-sm sm:p-6">
            <h2 className="text-lg font-bold text-brand-900">צריכים הובלה בירושלים? אנחנו כאן בשבילכם!</h2>
            <p className="mt-2 text-sm text-neutral-600">
              חייגו עכשיו{" "}
              <a href="tel:0525005573" className="font-semibold text-brand-700">
                052-500-55-73
              </a>{" "}
              או השאירו פרטים ונחזור אליכם בהקדם!
            </p>
            <div className="mt-4">
              <p className="mb-3 text-xs font-medium text-neutral-500">טופס (תצוגה בלבד — ללא שליחה)</p>
              <QuoteForm compact labelMode="placeholder" showEmail={false} />
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
