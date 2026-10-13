import { Button } from "@/components/ui/Button";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function InternalCTA({
  title = "רוצים לקבל הצעת מחיר מהירה?",
  showPhone = true,
  showQuote = true,
  showWhatsApp = true,
  animate = true,
}: {
  title?: string;
  showPhone?: boolean;
  showQuote?: boolean;
  showWhatsApp?: boolean;
  animate?: boolean;
}) {
  const body = (
      <aside className="internal-cta rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 text-center shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-brand-900 sm:text-2xl">{title}</h2>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          {showQuote ? (
            <Button href="/הצעת-מחיר/" variant="gold" className="min-h-[48px] min-w-[140px] px-6">
              הצעת מחיר
            </Button>
          ) : null}
          {showWhatsApp ? (
            <Button href={whatsAppUrl()} variant="whatsapp" className="min-h-[48px] min-w-[140px] px-6">
              WhatsApp
            </Button>
          ) : null}
          {showPhone ? (
            <Button
              href={`tel:${PHONE_TEL}`}
              variant="outlineDark"
              className="min-h-[48px] min-w-[180px] px-6"
              aria-label={`התקשרו ${PHONE_DISPLAY}`}
            >
              <PhoneHandsetIcon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap" dir="ltr">
                {PHONE_DISPLAY}
              </span>
            </Button>
          ) : null}
        </div>
      </aside>
  );

  if (!animate) return body;
  return <ScrollReveal variant="card">{body}</ScrollReveal>;
}
