"use client";

import { useState } from "react";
import { LinkedText, type TextLink } from "@/components/ui/LinkedText";

export type FaqItem = { question: string; answer: string; links?: TextLink[] };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {items.map((item, index) => {
        const open = openIndex === index;
        const id = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;
        const isLast = index === items.length - 1;
        return (
          <div key={item.question} className={!isLast ? "border-b border-neutral-100" : ""}>
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-base font-semibold text-brand-800 transition hover:bg-brand-50/50 min-h-[44px] sm:px-5 sm:text-[1.05rem]"
                aria-expanded={open}
                aria-controls={id}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span className="pe-2">{item.question}</span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors ${open ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700"}`}
                  aria-hidden="true"
                >
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={id}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="border-t border-neutral-50 bg-neutral-50/40 px-4 pb-5 pt-3 text-base leading-[1.8] text-neutral-700 whitespace-pre-line sm:px-5"
            >
              <LinkedText text={item.answer} links={item.links} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
