"use client";

import { QuoteForm } from "@/components/forms/QuoteForm";

export function HeroQuickQuoteForm({
  heading,
  supporting,
  pagePath,
  pageTitle,
  pageType,
  serviceContext,
}: {
  heading: string;
  supporting: string;
  pagePath: string;
  pageTitle: string;
  pageType: string;
  serviceContext?: string;
}) {
  return (
    <div
      className="w-full rounded-xl bg-white/[0.97] p-3 shadow-sm ring-1 ring-white/80 sm:p-4 lg:max-w-[380px]"
      data-hero-quick-quote
    >
      <p className="text-sm font-bold leading-snug text-brand-800">{heading}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{supporting}</p>
      <div className="mt-2">
        <QuoteForm
          variant="hero"
          compact
          heroDense
          showEmail={false}
          labelMode="placeholder"
          metadata={{
            formId: "hero-quick-quote",
            formType: "hero-quick-quote",
            pagePath,
            pageTitle,
            pageType,
            serviceContext,
          }}
        />
      </div>
    </div>
  );
}
