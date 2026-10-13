"use client";

import { useEffect, useState } from "react";
import { AccessibilityWidget } from "@/components/accessibility/AccessibilityWidget";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";

const SCROLL_SHOW = 320;

const fabClass =
  "inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full shadow-lg transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

const scrollHiddenClass =
  "invisible opacity-0 pointer-events-none motion-reduce:opacity-0 motion-reduce:invisible";

/**
 * Fixed controls — physical positioning (RTL-independent):
 * RIGHT: Phone + WhatsApp (after scroll)
 * LEFT: Accessibility (always) + Scroll-to-top (after scroll)
 * Stay visible through forms, conversion blocks and the footer.
 */
export function FixedControls() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_SHOW);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  const scrollFabHidden = scrolled ? "" : scrollHiddenClass;

  return (
    <>
      <nav
        role="group"
        className="fixed-controls fixed bottom-3 right-3 z-[60] flex flex-col items-center gap-4 sm:bottom-4 sm:right-4"
        aria-label="יצירת קשר מהירה"
        data-fixed-control
      >
        <a
          href={whatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`${fabClass} bg-[#25D366] text-white hover:bg-[#1ebe57] focus-visible:ring-brand-500 ${scrollFabHidden}`}
          aria-label="שליחת הודעת WhatsApp"
          aria-hidden={!scrolled}
          tabIndex={scrolled ? 0 : -1}
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <a
          href={`tel:${PHONE_TEL}`}
          className={`${fabClass} bg-brand-700 text-white hover:bg-brand-600 focus-visible:ring-accent ${scrollFabHidden}`}
          aria-label={`התקשרו אלינו ${PHONE_DISPLAY}`}
          aria-hidden={!scrolled}
          tabIndex={scrolled ? 0 : -1}
        >
          <PhoneHandsetIcon className="h-5 w-5" />
        </a>
      </nav>

      <nav
        role="group"
        className="fixed-controls fixed bottom-3 left-3 z-[60] flex flex-col-reverse items-center gap-4 sm:bottom-4 sm:left-4"
        aria-label="כלי נגישות"
        data-fixed-control
      >
        <AccessibilityWidget panelAlign="start" />
        <button
          type="button"
          onClick={scrollToTop}
          className={`${fabClass} bg-accent text-brand-900 hover:bg-accent-300 focus-visible:ring-brand-500 ${scrollFabHidden}`}
          aria-label="גלילה לראש העמוד"
          aria-hidden={!scrolled}
          tabIndex={scrolled ? 0 : -1}
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </nav>
    </>
  );
}
