import { QuoteForm } from "@/components/forms/QuoteForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";
import { sectionPad } from "@/lib/layout";

/** Unified final conversion — CTA + compact quote form in one card (Phase 2B.4B / 2B.6) */
export function FinalConversionSection({
  title = "רוצים לקבל הצעת מחיר מהירה?",
  subtitle = "ספרו לנו כמה פרטים ונחזור אליכם בהקדם עם הצעה מותאמת.",
  inspired = false,
}: {
  title?: string;
  subtitle?: string;
  /** Homepage-aligned outer rhythm (Phase 2B.6 reference pages) */
  inspired?: boolean;
}) {
  const outerClass = inspired
    ? `border-t border-brand-200/60 bg-gradient-to-b from-brand-100/70 via-brand-50 to-white ${sectionPad.cta}`
    : `bg-brand-50/50 ${sectionPad.cta}`;

  return (
    <section className={outerClass} data-final-conversion>
      <Container width="content">
        <div className="rounded-3xl border border-brand-200/50 bg-gradient-to-br from-white via-brand-50/30 to-white p-5 shadow-soft sm:p-8 lg:p-10">
          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-10 xl:gap-14">
            <div className="flex min-w-0 flex-col justify-center text-center lg:text-start">
              <h2 className="text-xl font-bold text-brand-900 sm:text-2xl lg:text-[1.65rem]">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">{subtitle}</p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                <Button href={`tel:${PHONE_TEL}`} variant="outlineDark" className="min-h-[48px] justify-center">
                  <PhoneHandsetIcon className="h-4 w-4 shrink-0" />
                  <span dir="ltr">{PHONE_DISPLAY}</span>
                </Button>
                <Button href={whatsAppUrl()} variant="whatsapp" className="min-h-[48px] justify-center">
                  WhatsApp
                </Button>
                <Button href="/הצעת-מחיר/" variant="gold" className="min-h-[48px] justify-center">
                  הצעת מחיר
                </Button>
              </div>
            </div>
            <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 lg:p-7">
              <p className="mb-4 text-sm font-semibold text-brand-900">טופס הצעת מחיר</p>
              <QuoteForm compact labelMode="placeholder" showEmail={false} variant="section" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
