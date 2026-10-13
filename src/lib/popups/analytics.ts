import type { PopupContextType, PopupOpenMethod } from "@/lib/popups/types";

export type PopupAnalyticsEvent =
  | "popup_view"
  | "popup_close"
  | "popup_submit"
  | "popup_minimized_cta_view"
  | "popup_minimized_cta_click";

export type PopupAnalyticsPayload = {
  popup_id: string;
  popup_context: PopupContextType;
  page_path: string;
  open_method?: PopupOpenMethod;
};

/** GA4-ready hook — no PII, no-op until tracking is enabled. */
export function trackPopupEvent(event: PopupAnalyticsEvent, payload: PopupAnalyticsPayload) {
  if (process.env.NODE_ENV === "development") {
    console.info("[popup-analytics]", event, payload);
  }
  const w = typeof window !== "undefined" ? (window as Window & { dataLayer?: unknown[] }) : undefined;
  w?.dataLayer?.push({ event, ...payload });
}
