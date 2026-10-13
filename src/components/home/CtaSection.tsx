import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PHONE_TEL, PHONE_DISPLAY, whatsAppUrl } from "@/lib/constants";
import { sectionPad } from "@/lib/layout";
import { sectionTitleClass } from "@/lib/ui-tokens";

export function CtaSection() {
  return (
    <section
      className={`border-t border-brand-200/60 bg-gradient-to-b from-brand-100/70 via-brand-50 to-brand-100/40 ${sectionPad.cta}`}
      aria-labelledby="final-cta-heading"
      data-final-conversion
    >
      <Container className="text-center">
        <ScrollReveal variant="subtle">
          <h2 id="final-cta-heading" className={sectionTitleClass}>
            יש לכם שאלות? בואו נסגור לכם פינה!
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-700 sm:text-lg">
            הובלות בירושלים והסביבה כולל אריזה ואחסנה — צרו קשר עכשיו לקבלת הצעת מחיר מיידית.
          </p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              href="/הצעת-מחיר"
              variant="gold"
              className="w-full min-h-[48px] px-8 text-base sm:w-auto sm:min-w-[200px]"
            >
              הצעת מחיר
            </Button>
            <Button
              href={whatsAppUrl()}
              variant="whatsapp"
              className="w-full min-h-[46px] sm:w-auto sm:min-w-[148px]"
            >
              WhatsApp
            </Button>
            <Button
              href={`tel:${PHONE_TEL}`}
              variant="outlineDark"
              className="w-full min-h-[46px] sm:w-auto sm:min-w-[180px]"
              aria-label={`התקשרו לאקספרס הובלות: ${PHONE_DISPLAY}`}
            >
              <span dir="ltr">{PHONE_DISPLAY}</span>
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
