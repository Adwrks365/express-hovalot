"use client";

import { useId, useState, type ReactNode } from "react";

export type RichFaqItem = { question: string; answer: ReactNode };

export function RichFaq({ items }: { items: RichFaqItem[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div
            key={`${index}-${item.question}`}
            className={`overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-200 ${isOpen ? "border-brand-200 shadow-soft" : "border-neutral-200/80 shadow-card"}`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex min-h-[56px] w-full items-center justify-between gap-4 px-4 py-3.5 text-start text-base font-semibold text-brand-800 transition-colors hover:bg-brand-50/60 sm:px-6 sm:text-[1.075rem]"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-[transform,background-color,color] duration-200 ${isOpen ? "rotate-45 bg-accent text-brand-900" : "bg-brand-50 text-brand-700"}`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="border-t border-brand-50 px-4 pb-5 pt-4 sm:px-6">
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
