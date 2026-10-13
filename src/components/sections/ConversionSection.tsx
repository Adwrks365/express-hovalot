import { InternalCTA } from "@/components/internal/InternalCTA";
import { RichText } from "@/components/internal/RichText";
import { ContactForm } from "@/components/forms/ContactForm";
import { QuoteForm } from "@/components/forms/QuoteForm";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { layoutWidth } from "@/lib/layout";

export function ConversionSection({
  introHtml,
  formVariant = "quote",
  formTitle,
  showForm = true,
  tone = "muted",
}: {
  introHtml?: string | null;
  formVariant?: "quote" | "contact" | "lead";
  formTitle?: string | null;
  showForm?: boolean;
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone} pad="cta">
      <div className={`mx-auto w-full min-w-0 space-y-8 sm:space-y-10 ${layoutWidth.content}`}>
        {introHtml ? (
          <div className={`w-full min-w-0 ${layoutWidth.proseWide}`}>
            <RichText html={introHtml} variant="wide" animate={false} />
          </div>
        ) : null}
        <div className={`w-full min-w-0 ${layoutWidth.prose}`}>
          <InternalCTA showQuote animate={false} />
        </div>
        {showForm ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,330px)] lg:items-start lg:gap-10">
            <div className="min-w-0">
              {formTitle ? (
                <h2 className="mb-3 text-xl font-bold text-brand-900 sm:mb-4 sm:text-2xl">{formTitle}</h2>
              ) : null}
              <p className="text-sm text-neutral-600 sm:text-base">
                השאירו פרטים ונחזור אליכם בהקדם עם הצעה מותאמת.
              </p>
            </div>
            <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="mb-4 text-sm font-medium text-neutral-500">טופס (תצוגה בלבד — ללא שליחה)</p>
              {formVariant === "contact" ? (
                <ContactForm />
              ) : (
                <QuoteForm compact labelMode="placeholder" showEmail={false} />
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
