"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1400;
const NUMERIC = /^\d{1,3}(,\d{3})*(\.\d+)?$|^\d+(\.\d+)?$/;

function format(n: number, template: string): string {
  const decimals = template.split(".")[1]?.length ?? 0;
  const fixed = n.toFixed(decimals);
  if (!template.includes(",")) return fixed;
  const [int, frac] = fixed.split(".");
  const grouped = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

/**
 * Statistic counter: renders the exact final value on the server, then counts up once when it first
 * enters the viewport. Non-numeric values and reduced-motion users get the final value only.
 */
export function AnimatedCounter({ value, prefix = "", suffix = "", className = "" }: { value: string; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !NUMERIC.test(value)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = Number(value.replace(/,/g, ""));
    if (!Number.isFinite(target) || target === 0) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(t >= 1 ? value : format(target * eased, value));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(format(0, value));
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} data-counter={value} data-stat-source={value}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
