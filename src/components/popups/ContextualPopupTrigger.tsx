"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useContextualPopup } from "@/components/popups/ContextualPopupProvider";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  openMethod?: "in_content_cta" | "manual_trigger";
};

export function ContextualPopupTrigger({ children, openMethod = "in_content_cta", className, ...rest }: Props) {
  const { openPopup, config } = useContextualPopup();
  if (!config) return null;

  return (
    <button
      type="button"
      data-open-contextual-popup="true"
      className={className}
      onClick={() => openPopup(openMethod)}
      {...rest}
    >
      {children}
    </button>
  );
}
