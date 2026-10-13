"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  applyA11yPrefs,
  defaultA11yPrefs,
  loadA11yPrefs,
  saveA11yPrefs,
  type AccessibilityPrefs,
} from "@/lib/accessibility-prefs";

type A11yToggleKey = Exclude<keyof AccessibilityPrefs, "fontScale">;

type ToolItem = {
  id: string;
  label: string;
  icon: ReactNode;
  toggleKey?: A11yToggleKey;
  action?: "fontUp" | "fontDown" | "reset";
};

function IconZoomPlus() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5L20 20M10 7v6M7 10h6" strokeLinecap="round" />
    </svg>
  );
}

function IconZoomMinus() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5L20 20M7 10h6" strokeLinecap="round" />
    </svg>
  );
}

function IconGrayscale() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="5" width="3" height="14" rx="0.5" />
      <rect x="8" y="5" width="4" height="14" rx="0.5" opacity="0.75" />
      <rect x="13" y="5" width="5" height="14" rx="0.5" opacity="0.5" />
      <rect x="19" y="5" width="2" height="14" rx="0.5" opacity="0.35" />
    </svg>
  );
}

function IconContrast() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="M12 3a9 9 0 000 18V3z" fill="white" />
    </svg>
  );
}

function IconInvert() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3c-4.5 0-8 3.5-8 8s3.5 8 8 8V3z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function IconLightBg() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 18h6M10 22h4M12 2v2M4.9 4.9l1.4 1.4M2 12h2M4.9 19.1l1.4-1.4M19.1 19.1l-1.4-1.4M22 12h-2M19.1 4.9l-1.4 1.4" strokeLinecap="round" />
      <path d="M12 6a4 4 0 014 4c0 2-2 3-2 5H10c0-2-2-3-2-5a4 4 0 014-4z" />
    </svg>
  );
}

function IconLinks() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10 13a5 5 0 007.1 0l1.4-1.4a5 5 0 00-7.1-7.1L10.5 6" strokeLinecap="round" />
      <path d="M14 11a5 5 0 00-7.1 0L5.5 12.4a5 5 0 007.1 7.1L13.5 18" strokeLinecap="round" />
    </svg>
  );
}

function IconFontA() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <text x="5" y="18" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif">
        A
      </text>
    </svg>
  );
}

function IconReset() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 12a8 8 0 0113.7-5.7M20 12a8 8 0 01-13.7 5.7" strokeLinecap="round" />
      <path d="M4 4v4h4M20 20v-4h-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TOOLS: ToolItem[] = [
  { id: "fontUp", label: "הגדל טקסט", icon: <IconZoomPlus />, action: "fontUp" },
  { id: "fontDown", label: "הקטן טקסט", icon: <IconZoomMinus />, action: "fontDown" },
  { id: "grayscale", label: "גווני אפור", icon: <IconGrayscale />, toggleKey: "grayscale" },
  { id: "highContrast", label: "ניגודיות גבוהה", icon: <IconContrast />, toggleKey: "highContrast" },
  { id: "negativeContrast", label: "ניגודיות הפוכה", icon: <IconInvert />, toggleKey: "negativeContrast" },
  { id: "lightBackground", label: "רקע בהיר", icon: <IconLightBg />, toggleKey: "lightBackground" },
  { id: "underlineLinks", label: "הדגשת קישורים", icon: <IconLinks />, toggleKey: "underlineLinks" },
  { id: "readableFont", label: "פונט קריא", icon: <IconFontA />, toggleKey: "readableFont" },
  { id: "reset", label: "איפוס", icon: <IconReset />, action: "reset" },
];

export function AccessibilityWidget({ panelAlign = "start" }: { panelAlign?: "start" | "end" }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(defaultA11yPrefs);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loaded = loadA11yPrefs();
    applyA11yPrefs(loaded);
    requestAnimationFrame(() => setPrefs(loaded));
  }, []);

  useEffect(() => {
    if (open) document.documentElement.setAttribute("data-a11y-open", "");
    else document.documentElement.removeAttribute("data-a11y-open");
    return () => document.documentElement.removeAttribute("data-a11y-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function update(next: Partial<AccessibilityPrefs>) {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    saveA11yPrefs(merged);
    applyA11yPrefs(merged);
  }

  function reset() {
    setPrefs(defaultA11yPrefs);
    saveA11yPrefs(defaultA11yPrefs);
    applyA11yPrefs(defaultA11yPrefs);
  }

  function onToolClick(tool: ToolItem) {
    if (tool.action === "fontUp") update({ fontScale: Math.min(prefs.fontScale + 0.1, 1.3) });
    else if (tool.action === "fontDown") update({ fontScale: Math.max(prefs.fontScale - 0.1, 0.9) });
    else if (tool.action === "reset") reset();
    else if (tool.toggleKey) update({ [tool.toggleKey]: !prefs[tool.toggleKey] });
  }

  function isPressed(tool: ToolItem): boolean {
    if (!tool.toggleKey) return false;
    return Boolean(prefs[tool.toggleKey]);
  }

  const panelPos = panelAlign === "start" ? "left-0" : "right-0";

  return (
    <div className="relative">
      {open ? (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-label="כלי נגישות"
          className={`absolute bottom-[calc(100%+0.75rem)] ${panelPos} z-[70] w-[min(100vw-2rem,15.5rem)] overflow-hidden rounded-lg border border-brand-700/30 bg-white shadow-elevated`}
        >
          <div className="border-s-4 border-brand-700 bg-brand-50/80 px-3 py-2.5">
            <p className="text-base font-bold text-brand-900">כלי נגישות</p>
          </div>
          <ul className="max-h-[min(70dvh,22rem)] overflow-y-auto overscroll-contain py-1" role="list">
            {TOOLS.map((tool) => (
              <li key={tool.id}>
                <button
                  type="button"
                  className={`flex w-full min-h-[44px] items-center justify-between gap-2 border-b border-neutral-100 px-3 py-2.5 text-start text-[15px] font-medium text-neutral-900 transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none ${isPressed(tool) ? "bg-brand-50/90" : ""}`}
                  onClick={() => onToolClick(tool)}
                  aria-pressed={tool.toggleKey ? isPressed(tool) : undefined}
                >
                  <span>{tool.label}</span>
                  <span className="text-brand-800">{tool.icon}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-neutral-100 px-3 py-2 text-center">
            <Link
              href="/accessibility-statement/"
              className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-900"
              onClick={() => setOpen(false)}
            >
              הצהרת נגישות
            </Link>
          </div>
        </div>
      ) : null}

      <button
        ref={buttonRef}
        id="accessibility-widget-button"
        type="button"
        data-testid="accessibility-widget"
        className="inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border-2 border-brand-700 bg-brand-600 text-white shadow-lg hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="פתיחת כלי נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="4.25" r="2" fill="currentColor" stroke="none" />
          <path d="M4.5 8.5c2.5.8 5 1.2 7.5 1.2s5-.4 7.5-1.2" />
          <path d="M12 9.7v4.8" />
          <path d="M12 14.5l-3.2 6.5M12 14.5l3.2 6.5" />
        </svg>
      </button>
    </div>
  );
}
