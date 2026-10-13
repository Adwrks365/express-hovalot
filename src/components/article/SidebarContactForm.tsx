"use client";

import { ContextualPopupTrigger } from "@/components/popups/ContextualPopupTrigger";
import { CtaButtonLink } from "@/components/redesign/CtaButtons";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";

export function SidebarContactForm() {
  return (
    <section aria-labelledby="sidebar-contact-heading" className="rounded-2xl bg-brand-900 p-5 text-white shadow-soft">
      <h2 id="sidebar-contact-heading" className="mb-4 text-base font-bold">
        טופס יצירת קשר
      </h2>
      <div className="flex flex-col gap-2.5 [&_a]:!w-full">
        <ContextualPopupTrigger
          openMethod="in_content_cta"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-accent px-5 text-base font-bold text-brand-900 shadow-sm hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          השאירו פרטים
        </ContextualPopupTrigger>
        <CtaButtonLink button={{ label: PHONE_DISPLAY, href: `tel:${PHONE_TEL}`, kind: "phone" }} surface="dark" />
        <CtaButtonLink button={{ label: "WhatsApp", href: whatsAppUrl(), kind: "whatsapp" }} surface="dark" />
      </div>
    </section>
  );
}
