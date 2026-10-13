import type { PopupTriggerProfile } from "@/lib/popups/types";

export type TriggerThresholds = {
  scrollRatio: number;
  dwellMs: number;
};

export const TRIGGER_THRESHOLDS: Record<Exclude<PopupTriggerProfile, "none">, TriggerThresholds> = {
  service: { scrollRatio: 0.5, dwellMs: 40_000 },
  article: { scrollRatio: 0.6, dwellMs: 55_000 },
};

export function scrollProgress(): number {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 1;
  return window.scrollY / max;
}
