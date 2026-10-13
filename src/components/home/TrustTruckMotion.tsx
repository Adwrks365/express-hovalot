"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  src: string;
  alt: string;
};

function maxTravelForViewport(width: number): number {
  if (width >= 1024) return 200;
  if (width >= 768) return 140;
  return 90;
}

/** Scroll-linked truck movement — isolated inner transform layer (IO + rAF + translate3d) */
export function TrustTruckMotion({ src, alt }: Props) {
  const motionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const section = document.getElementById("trust-truck");
    const motionEl = motionRef.current;
    if (!section || !motionEl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const entryRatio = 0.92;
    const exitRatio = -0.15;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const maxTravel = maxTravelForViewport(window.innerWidth);

      if (rect.bottom < 0) {
        motionEl.style.transform = `translate3d(${maxTravel}px, 0, 0)`;
        return;
      }
      if (rect.top > viewH) {
        motionEl.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      const startTop = viewH * entryRatio;
      const endTop = viewH * exitRatio;
      const span = startTop - endTop;
      const progress = span > 0 ? Math.min(1, Math.max(0, (startTop - rect.top) / span)) : 0;
      const tx = progress * maxTravel;
      motionEl.style.transform = `translate3d(${tx}px, 0, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    const onReducedChange = () => {
      if (reducedMotion.matches) {
        motionEl.style.transform = "translate3d(0, 0, 0)";
      } else {
        update();
      }
    };

    const observer = new IntersectionObserver(
      () => {
        onScroll();
      },
      { rootMargin: "20% 0px 20% 0px", threshold: 0 },
    );

    observer.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    reducedMotion.addEventListener("change", onReducedChange);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reducedMotion.removeEventListener("change", onReducedChange);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="truck-motion-host flex h-full w-full items-end">
      <div
        ref={motionRef}
        data-truck-motion
        className="truck-motion-inner flex h-full w-full items-end"
        style={{ willChange: "transform" }}
      >
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={515}
          className="trust-truck-foreground h-full max-h-full w-full object-contain object-bottom object-left drop-shadow-[0_12px_36px_rgba(0,0,0,0.45)] lg:drop-shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
          sizes="(max-width: 1024px) 88vw, 40vw"
        />
      </div>
    </div>
  );
}
