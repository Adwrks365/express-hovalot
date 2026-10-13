"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export type RevealVariant =
  | "heading"
  | "card"
  | "image"
  | "logo"
  | "slide-start"
  | "slide-end"
  | "subtle";

const variantClass: Record<RevealVariant, string> = {
  heading: "reveal-heading",
  card: "reveal-card",
  image: "reveal-image",
  logo: "reveal-logo",
  "slide-start": "reveal-slide-start",
  "slide-end": "reveal-slide-end",
  subtle: "reveal-subtle",
};

type Props = {
  children: ReactNode;
  variant?: RevealVariant;
  delayMs?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
};

export function ScrollReveal({
  children,
  variant = "subtle",
  delayMs = 0,
  className = "",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.classList.add("scroll-revealed");
      return;
    }

    const reveal = () => {
      el.classList.add("scroll-revealed");
      el.classList.remove("scroll-reveal-armed");
    };

    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight;
    // Above the fold: reveal immediately — never arm (avoids global flash / CLS).
    if (rect.top < viewportH && rect.bottom > 0) {
      reveal();
      return;
    }

    el.classList.add("scroll-reveal-armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 5% 0px" },
    );

    observer.observe(el);

    const fallback = window.setTimeout(reveal, 2500);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-scroll-reveal={variant}
      className={`${variantClass[variant]} ${className}`.trim()}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
