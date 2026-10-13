import { QuoteForm } from "@/components/forms/QuoteForm";
import { Container } from "@/components/ui/Container";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WhatsAppIcon } from "@/components/redesign/CtaButtons";
import { RichContent } from "@/components/redesign/RichContent";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";
import type { RichBlock } from "@/lib/redesign/types";

export const DEFAULT_TITLE = "רוצים לקבל הצעת מחיר מהירה?";
const DEFAULT_TEXT = "ספרו לנו כמה פרטים ונחזור אליכם בהקדם עם הצעה מותאמת.";

/**
 * Single closing conversion block: copy + direct contact on the reading-start side,
 * quote form on the other side (stacked on mobile).
 */
export function RedesignConversion({
  title,
  text,
  body,
}: {
  title?: string | null;
  text?: string | null;
  body?: RichBlock[];
}) {
  const heading = title || DEFAULT_TITLE;
  return (
    <section id="contact" className="bg-gradient-to-b from-white via-brand-50/80 to-brand-100/60 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20" data-final-conversion data-section-type="final-conversion">
      <Container width="standard">
        <ScrollReveal variant="subtle">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-elevated ring-1 ring-brand-100">
            <div className="grid lg:grid-cols-2">
              <div className="relative overflow-hidden bg-[linear-gradient(155deg,#003405_0%,#13330E_60%,#0a1f0a_100%)] px-6 py-9 text-white sm:px-10 sm:py-11 lg:px-10 lg:py-12">
                <div className="absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
                <div className="relative">
                  <h2 className="text-balance text-[1.65rem] font-bold leading-snug sm:text-3xl">{heading}</h2>
                  <span className="mt-4 block h-1 w-14 rounded-full bg-accent" aria-hidden="true" />
                  {body?.length ? (
                    <RichContent blocks={body} tone="dark" className="mt-5" />
                  ) : (
                    <p className="mt-5 text-base leading-relaxed text-white/85 sm:text-lg">{text || DEFAULT_TEXT}</p>
                  )}
                  <ul className="mt-8 space-y-3">
                    <li>
                      <a href={`tel:${PHONE_TEL}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 transition-colors hover:border-accent/60 hover:bg-white/10">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-brand-900">
                          <PhoneHandsetIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-white/65">חייגו עכשיו</span>
                          <span className="block text-lg font-bold tracking-wide" dir="ltr">
                            {PHONE_DISPLAY}
                          </span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href={whatsAppUrl()} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 transition-colors hover:border-[#25D366]/70 hover:bg-white/10">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                          <WhatsAppIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-white/65">שלחו הודעה</span>
                          <span className="block text-lg font-bold">WhatsApp</span>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-5 py-8 sm:px-10 sm:py-11 lg:px-10 lg:py-12">
                <p className="mb-1 text-lg font-bold text-brand-800">טופס הצעת מחיר</p>
                <p className="mb-6 text-sm text-neutral-500">השאירו פרטים ונחזור אליכם בהקדם.</p>
                <QuoteForm variant="section" showEmail={false} />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
