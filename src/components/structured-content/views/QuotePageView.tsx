import { QuoteForm } from "@/components/forms/QuoteForm";
import { Container } from "@/components/ui/Container";
import { IntroBlockSection } from "@/components/structured-content/IntroBlockSection";
import { StructuredFaqSection } from "@/components/structured-content/StructuredFaqSection";
import { renderStructuredSection } from "@/components/structured-content/render-structured-section";
import { sectionPad } from "@/lib/layout";
import { radius } from "@/lib/ui-tokens";
import type { StructuredPageModel } from "@/lib/structured-content/types";

export function QuotePageView({ model }: { model: StructuredPageModel }) {
  const faqSections = model.sections.filter((s) => s.type === "faq");
  const contentSections = model.sections.filter((s) => s.type !== "faq");

  return (
    <>
      {model.intro ? <IntroBlockSection intro={model.intro} tone="muted" /> : null}

      {contentSections.map((section, index) => renderStructuredSection(section, index))}

      <section className={`bg-brand-50/45 ${sectionPad.normal}`} data-quote-form-block>
        <Container width="standard">
          <div className={`mx-auto grid max-w-[75rem] gap-8 lg:grid-cols-[1fr_420px] lg:gap-12`}>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">קבלו הצעת מחיר מותאמת</h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-neutral-600">
                מלאו את הטופס ונחזור אליכם עם הצעה מדויקת לפי סוג ההובלה או האחסון.
              </p>
            </div>
            <div className={`border border-neutral-200/90 bg-white p-6 shadow-soft sm:p-7 ${radius.panel}`}>
              <QuoteForm variant="section" compact={false} labelMode="placeholder" showEmail={false} />
            </div>
          </div>
        </Container>
      </section>

      {faqSections.map((section, index) =>
        section.type === "faq" ? (
          <StructuredFaqSection
            key={section.id}
            heading={section.heading}
            intro={section.intro}
            items={section.items}
            tone={index % 2 === 0 ? "white" : "muted"}
          />
        ) : null,
      )}
    </>
  );
}
