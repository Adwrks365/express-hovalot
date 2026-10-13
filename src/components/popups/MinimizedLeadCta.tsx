"use client";

import { useEffect } from "react";
import { trackPopupEvent } from "@/lib/popups/analytics";
import type { PopupPageConfig } from "@/lib/popups/types";

export function MinimizedLeadCta({
  config,
  onOpen,
  onDismissForVisit,
}: {
  config: PopupPageConfig;
  onOpen: () => void;
  onDismissForVisit: () => void;
}) {
  useEffect(() => {
    trackPopupEvent("popup_minimized_cta_view", {
      popup_id: "contextual-lead",
      popup_context: config.context,
      page_path: config.pagePath,
    });
  }, [config.context, config.pagePath]);

  return (
    <div
      className="pointer-events-none fixed bottom-2.5 left-1/2 z-[58] w-[min(calc(100vw-7.25rem),15.5rem)] -translate-x-1/2 sm:bottom-3.5"
      data-minimized-lead-cta
    >
      <div className="pointer-events-auto relative flex items-stretch overflow-hidden rounded-full bg-[linear-gradient(135deg,#003405_0%,#0d4a1a_100%)] text-white shadow-md ring-1 ring-white/15 motion-safe:animate-[popup-pill-in_320ms_ease-out] motion-reduce:animate-none">
        <button
          type="button"
          onClick={() => {
            trackPopupEvent("popup_minimized_cta_click", {
              popup_id: "contextual-lead",
              popup_context: config.context,
              page_path: config.pagePath,
              open_method: "minimized_cta",
            });
            onOpen();
          }}
          className="flex min-h-[38px] flex-1 items-center gap-2 px-2.5 py-1.5 text-start focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset sm:min-h-[40px] sm:px-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent sm:h-8 sm:w-8" aria-hidden="true">
            <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M8 10h8M8 14h5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11A2.5 2.5 0 0117.5 20h-11A2.5 2.5 0 014 17.5v-11z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-bold sm:text-[13px]">קבלו הצעת מחיר</span>
            <span className="hidden truncate text-[10px] text-white/75 sm:block sm:text-[11px]">מהירה וללא התחייבות</span>
          </span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismissForVisit();
          }}
          className="flex w-8 shrink-0 items-center justify-center border-s border-white/15 text-white/80 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent sm:w-9"
          aria-label="הסתרת כפתור הצעה לעמוד זה"
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
