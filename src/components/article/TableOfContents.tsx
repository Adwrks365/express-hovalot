"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/article-utils";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-brand-700 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length || !open) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.25] },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items, open]);

  if (!items.length) return null;

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-offset").trim();
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const offset = raw.endsWith("rem")
      ? Number.parseFloat(raw) * rootSize
      : Number.parseFloat(raw) || 88;
    const top = el.getBoundingClientRect().top + window.scrollY - offset - 12;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <nav aria-label="תוכן עניינים" className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <h2 className="sr-only">תוכן עניינים</h2>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start font-bold text-brand-900 sm:px-5"
        aria-expanded={open}
        aria-controls="article-toc-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span>תוכן עניינים</span>
        <Chevron open={open} />
      </button>
      <div id="article-toc-panel" hidden={!open} className="border-t border-neutral-100 px-4 pb-4 pt-2 sm:px-5">
        <ol className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "me-4" : ""}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.id);
                }}
                className={`block leading-snug transition-colors hover:text-brand-600 ${
                  active === item.id ? "font-semibold text-brand-700" : "text-neutral-600"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
