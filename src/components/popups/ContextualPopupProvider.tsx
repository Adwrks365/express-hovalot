"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { MinimizedLeadCta } from "@/components/popups/MinimizedLeadCta";
import { trackPopupEvent } from "@/lib/popups/analytics";
import { isDismissCooldownActive, isSubmitCooldownActive, recordPopupDismiss, recordPopupSubmit } from "@/lib/popups/persistence";
import { markAutoShownOnPath, markAutoShownThisSession, wasAutoShownThisSession } from "@/lib/popups/session";
import { scrollProgress, TRIGGER_THRESHOLDS } from "@/lib/popups/triggers";
import type { PopupOpenMethod, PopupPageConfig } from "@/lib/popups/types";

const ContextualLeadPopup = dynamic(
  () => import("@/components/popups/ContextualLeadPopup").then((m) => m.ContextualLeadPopup),
  { ssr: false },
);

type PopupContextValue = {
  config: PopupPageConfig | null;
  registerPage: (config: PopupPageConfig | null) => void;
  openPopup: (method: PopupOpenMethod) => void;
};

const PopupContext = createContext<PopupContextValue | null>(null);

const noopRegistrar: PopupContextValue = {
  config: null,
  registerPage: () => {},
  openPopup: () => {},
};

export function useContextualPopup() {
  const ctx = useContext(PopupContext);
  return ctx ?? noopRegistrar;
}

function isLeadFormFocused(): boolean {
  const el = document.activeElement;
  if (!el || !(el instanceof HTMLElement)) return false;
  const form = el.closest("form");
  if (!form) return false;
  if (form.hasAttribute("data-popup-lead-form")) return false;
  if (form.hasAttribute("data-lead-form")) return true;
  if (form.closest("[data-home-hero]")) return true;
  if (form.closest("[data-redesign-hero]")) return true;
  if (form.closest("[data-hero-quick-quote]")) return true;
  if (form.closest("[data-final-conversion]")) return true;
  if (form.closest("[data-footer-utility-form]")) return true;
  return false;
}

function isA11yPanelOpen(): boolean {
  return document.documentElement.hasAttribute("data-a11y-open");
}

export function ContextualPopupProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PopupPageConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openMethod, setOpenMethod] = useState<PopupOpenMethod>("automatic");
  const [showPill, setShowPill] = useState(false);
  const [pillHiddenPath, setPillHiddenPath] = useState<string | null>(null);
  const [submittedHide, setSubmittedHide] = useState(false);

  const conversionVisibleRef = useRef(false);
  const formFocusRef = useRef(false);
  const autoTriggeredRef = useRef(false);
  const lastFocusReturnRef = useRef<HTMLElement | null>(null);

  const registerPage = useCallback((next: PopupPageConfig | null) => {
    setConfig(next);
    setIsOpen(false);
    setShowPill(false);
    setPillHiddenPath(null);
    setSubmittedHide(false);
    autoTriggeredRef.current = false;
    conversionVisibleRef.current = false;
    formFocusRef.current = false;
  }, []);

  const openPopup = useCallback(
    (method: PopupOpenMethod) => {
      if (!config || isOpen) return;
      if (isSubmitCooldownActive()) return;
      if (method === "automatic" && isDismissCooldownActive()) return;
      if (method === "automatic" && wasAutoShownThisSession()) return;
      lastFocusReturnRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpenMethod(method);
      setIsOpen(true);
      trackPopupEvent("popup_view", {
        popup_id: "contextual-lead",
        popup_context: config.context,
        page_path: config.pagePath,
        open_method: method,
      });
      if (method === "automatic") {
        markAutoShownThisSession();
        markAutoShownOnPath(config.pagePath);
        autoTriggeredRef.current = true;
      }
    },
    [config, isOpen],
  );

  const closePopup = useCallback(
    (reason: "x" | "backdrop" | "esc") => {
      setIsOpen(false);
      recordPopupDismiss();
      setShowPill(true);
      trackPopupEvent("popup_close", {
        popup_id: "contextual-lead",
        popup_context: config?.context ?? "general",
        page_path: config?.pagePath ?? "/",
        open_method: openMethod,
      });
      if (reason === "esc" || reason === "x") {
        window.setTimeout(() => lastFocusReturnRef.current?.focus(), 0);
      }
    },
    [config, openMethod],
  );

  const onSubmitSuccess = useCallback(() => {
    recordPopupSubmit();
    setSubmittedHide(true);
    setShowPill(false);
    setIsOpen(false);
    trackPopupEvent("popup_submit", {
      popup_id: "contextual-lead",
      popup_context: config?.context ?? "general",
      page_path: config?.pagePath ?? "/",
      open_method: openMethod,
    });
    window.setTimeout(() => lastFocusReturnRef.current?.focus(), 0);
  }, [config, openMethod]);

  const dismissPillForVisit = useCallback(() => {
    if (config) setPillHiddenPath(config.pagePath);
    setShowPill(false);
  }, [config]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const trigger = t.closest("[data-open-contextual-popup]");
      if (trigger) {
        e.preventDefault();
        openPopup(trigger.getAttribute("data-open-method") === "manual" ? "manual_trigger" : "in_content_cta");
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openPopup]);

  useEffect(() => {
    function onFocusIn() {
      formFocusRef.current = isLeadFormFocused();
    }
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusIn);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusIn);
    };
  }, []);

  useEffect(() => {
    if (!config?.autoOpenEnabled || config.triggerProfile === "none") return;

    const thresholds = TRIGGER_THRESHOLDS[config.triggerProfile];
    let timeoutId = 0;
    let fired = false;

    function canAutoOpen(): boolean {
      if (fired || autoTriggeredRef.current || isOpen) return false;
      if (isSubmitCooldownActive() || isDismissCooldownActive()) return false;
      if (wasAutoShownThisSession()) return false;
      if (isA11yPanelOpen()) return false;
      if (formFocusRef.current || isLeadFormFocused()) return false;
      if (conversionVisibleRef.current) return false;
      return true;
    }

    function tryOpen() {
      if (!canAutoOpen()) return;
      fired = true;
      openPopup("automatic");
    }

    function onScroll() {
      if (scrollProgress() >= thresholds.scrollRatio) tryOpen();
    }

    timeoutId = window.setTimeout(tryOpen, thresholds.dwellMs);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [config, isOpen, openPopup]);

  useEffect(() => {
    const nodes = document.querySelectorAll("[data-final-conversion], [data-home-hero] form");
    if (!nodes.length) {
      conversionVisibleRef.current = false;
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        conversionVisibleRef.current = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35, 0.5] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [config?.pagePath]);

  const showMinimized =
    Boolean(config) &&
    showPill &&
    !submittedHide &&
    !isSubmitCooldownActive() &&
    config!.pagePath !== pillHiddenPath;

  const value = useMemo(
    () => ({ config, registerPage, openPopup }),
    [config, registerPage, openPopup],
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
      {isOpen && config ? (
        <ContextualLeadPopup config={config} openMethod={openMethod} onClose={closePopup} onSubmitSuccess={onSubmitSuccess} />
      ) : null}
      {showMinimized && config ? (
        <MinimizedLeadCta config={config} onOpen={() => openPopup("minimized_cta")} onDismissForVisit={dismissPillForVisit} />
      ) : null}
    </PopupContext.Provider>
  );
}
