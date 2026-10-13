import { RichText } from "@/components/internal/RichText";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { ContactForm } from "@/components/forms/ContactForm";

export function FormBlockSection({
  title,
  bodyHtml,
  variant = "quote",
  tone = "muted",
}: {
  title?: string | null;
  bodyHtml?: string | null;
  variant?: "quote" | "contact" | "lead";
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone}>
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-12">
        <div className="min-w-0">
          {title ? <h2 className="mb-4 text-2xl font-bold text-brand-900">{title}</h2> : null}
          {bodyHtml ? <RichText html={bodyHtml} variant="wide" animate={false} /> : null}
        </div>
        <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-medium text-neutral-500">מלאו פרטים ונחזור אליכם</p>
          {variant === "contact" ? <ContactForm /> : <QuoteForm compact labelMode="placeholder" showEmail={false} />}
        </aside>
      </div>
    </SectionShell>
  );
}
