"use client";

import { useId, useState } from "react";
import type { FooterLinkItem } from "@/config/footer-content";
import { FooterLink } from "@/components/layout/FooterLink";

type Props = {
  id: string;
  label: string;
  href: string;
  links: FooterLinkItem[];
  defaultOpen?: boolean;
};

export function FooterAccordionGroup({ id, label, href, links, defaultOpen = false }: Props) {
  const uid = useId();
  const panelId = `${id}-panel-${uid}`;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-0">
      <div className="flex items-center justify-center gap-2 lg:justify-between">
        <FooterLink href={href} className="py-1.5 font-medium !text-neutral-200 hover:!text-accent-300">
          {label}
        </FooterLink>
      <button
        type="button"
        id={`${id}-trigger-${uid}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? `סגירת תת-תפריט ${label}` : `פתיחת תת-תפריט ${label}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-200 transition-colors hover:bg-white/10 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
      >
        <svg
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      </div>
      <ul
        id={panelId}
        role="region"
        aria-labelledby={`${id}-trigger-${uid}`}
        aria-hidden={!open}
        className={`space-y-0.5 overflow-hidden ps-1 transition-[max-height,opacity] duration-200 motion-reduce:transition-none ${open ? "max-h-[2000px] pb-1.5 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <FooterLink href={link.href} tabIndex={open ? undefined : -1}>
              {link.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
