"use client";

import { useEffect, useId, useRef } from "react";
import { ContextualLeadPopupForm } from "@/components/popups/ContextualLeadPopupForm";
import { getPopupMessaging } from "@/lib/popups/messaging";
import type { PopupOpenMethod, PopupPageConfig } from "@/lib/popups/types";

export function ContextualLeadPopup({
  config,
  openMethod,
  onClose,
  onSubmitSuccess,
}: {
  config: PopupPageConfig;
  openMethod: PopupOpenMethod;
  onClose: (reason: "x" | "backdrop" | "esc") => void;
  onSubmitSuccess: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const messaging = getPopupMessaging(config.context, {
    areaHeadline: config.areaHeadline,
    pageTitle: config.pageTitle,
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>("input:not([type=hidden]), textarea, button");
      (first ?? closeRef.current)?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose("esc");
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-brand-950/55 backdrop-blur-[2px]"
        aria-label="סגירת חלון"
        onClick={() => onClose("backdrop")}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[81] flex max-h-[min(92dvh,640px)] w-full max-w-[min(100vw-1.5rem,460px)] flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-elevated motion-reduce:transition-none"
      >
        <div className="shrink-0 bg-[linear-gradient(135deg,#003405_0%,#13330E_100%)] px-5 pb-4 pt-5 text-white sm:px-6">
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose("x")}
            className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="סגירה"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <p className="text-xs font-semibold tracking-wide text-accent-300">{messaging.brandLabel}</p>
          <h2 id={titleId} className="mt-2 pe-10 text-xl font-bold leading-snug sm:text-2xl">
            {messaging.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{messaging.description}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          <ContextualLeadPopupForm
            context={config.context}
            pageTitle={config.pageTitle}
            pagePath={config.pagePath}
            openMethod={openMethod}
            ctaLabel={messaging.cta}
            onSuccess={onSubmitSuccess}
          />
          {messaging.reassurance ? (
            <p className="mt-3 text-center text-xs text-neutral-500">{messaging.reassurance}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
