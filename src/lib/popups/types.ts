export type PopupContextType =
  | "moving-general"
  | "apartment-moving"
  | "small-moves"
  | "office-moving"
  | "storage"
  | "packing"
  | "crane-special"
  | "jerusalem-area"
  | "price-quote"
  | "article"
  | "general";

export type PopupTriggerProfile = "service" | "article" | "none";

export type PopupOpenMethod = "automatic" | "minimized_cta" | "in_content_cta" | "manual_trigger";

export type PopupPageConfig = {
  context: PopupContextType;
  pageTitle: string;
  pagePath: string;
  autoOpenEnabled: boolean;
  triggerProfile: PopupTriggerProfile;
  /** Area pages: dynamic headline from page title */
  areaHeadline?: string;
};

export type PopupMessaging = {
  brandLabel: string;
  headline: string;
  description: string;
  cta: string;
  reassurance?: string;
};
