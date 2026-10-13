import { QuoteForm } from "@/components/forms/QuoteForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { IntroBlockSection } from "@/components/structured-content/IntroBlockSection";
import { ProseBody } from "@/components/structured-content/ProseBody";
import { SectionIntro } from "@/components/structured-content/SectionIntro";
import { renderStructuredSection } from "@/components/structured-content/render-structured-section";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";
import { sectionPad } from "@/lib/layout";
import { radius } from "@/lib/ui-tokens";
import type { StructuredPageModel } from "@/lib/structured-content/types";

export function ContactPageView({ model }: { model: StructuredPageModel }) {
  const proseSections = model.sections.filter((s) => s.type === "prose");
  const designedSections = model.sections.filter((s) => s.type !== "prose");

  const contactCopy = proseSections[0]?.type === "prose" ? proseSections[0].body : model.intro;
  const extraProse = proseSections.slice(1);

  return (
    <>
      {model.intro && !contactCopy ? <IntroBlockSection intro={model.intro} tone="white" /> : null}

      <section className={`bg-white ${sectionPad.normal}`}>
        <Container width="standard">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="min-w-0">
              <SectionIntro heading={model.hero.title} intro={null} />
              {contactCopy ? <ProseBody content={contactCopy} /> : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            <div
              className={`min-w-0 border border-neutral-200/90 bg-white p-6 shadow-soft sm:p-8 ${radius.panel}`}
            >
              <h2 className="text-lg font-bold text-brand-900 sm:text-xl">טופס יצירת קשר</h2>
              <p className="mt-2 text-sm text-neutral-600">מלאו פרטים ונחזור אליכם בהקדם.</p>
              <div className="mt-5">
                <QuoteForm variant="section" compact labelMode="placeholder" showEmail />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {designedSections.map((section, index) => renderStructuredSection(section, index + 2))}
      {extraProse.map((section, index) =>
        section.type === "prose" ? (
          <div key={section.id}>{renderStructuredSection(section, index + 5)}</div>
        ) : null,
      )}
    </>
  );
}
