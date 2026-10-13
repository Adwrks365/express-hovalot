"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { MEDIA } from "@/config/media-paths";
import { radius } from "@/lib/ui-tokens";

export type MarqueeLogo = { name: string; path: string };

function LogoCell({ logo, decorative = false }: { logo: MarqueeLogo; decorative?: boolean }) {
  return (
    <div
      className={`flex h-[86px] w-[104px] shrink-0 items-center justify-center bg-neutral-50 px-2.5 py-2 ring-1 ring-neutral-100 sm:h-[94px] sm:w-[112px] ${radius.card}`}
    >
      <Image
        src={logo.path}
        alt={decorative ? "" : logo.name}
        width={104}
        height={62}
        sizes="104px"
        aria-hidden={decorative ? true : undefined}
        draggable={false}
        className="h-[62px] w-[90px] max-w-[90px] object-contain object-center opacity-90 grayscale transition duration-[220ms] ease-out hover:scale-[1.09] hover:opacity-100 hover:grayscale-0 hover:shadow-sm active:scale-[1.04] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:h-[66px] sm:w-[96px] sm:max-w-[96px] lg:h-[68px]"
      />
    </div>
  );
}

/** Seamless infinite marquee — loop distance = measured width of one logo set */
export function ClientLogoMarquee({
  logos = MEDIA.clientLogos,
  fade = "white",
}: {
  logos?: readonly MarqueeLogo[];
  fade?: "white" | "mist";
} = {}) {
  const fadeFrom = fade === "mist" ? "from-brand-50/80" : "from-white";
  const setRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const set = setRef.current;
    const track = trackRef.current;
    if (!set || !track) return;

    const measure = () => {
      const width = Math.round(set.getBoundingClientRect().width);
      if (width > 0) {
        track.style.setProperty("--marquee-shift", `${width}px`);
        track.classList.add("logo-marquee-ready");
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(set);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <ul className="sr-only" aria-label="לקוחות שבחרו באקספרס הובלות">
        {logos.map((logo, i) => (
          <li key={`sr-${i}`}>{logo.name}</li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto pb-1 motion-reduce:block [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-4 px-4 sm:mx-auto sm:gap-[18px] sm:px-0">
          {logos.map((logo, i) => (
            <li key={i}>
              <LogoCell logo={logo} />
            </li>
          ))}
        </ul>
      </div>

      <div
        className="logo-marquee group relative w-full overflow-hidden motion-reduce:hidden"
        dir="ltr"
        aria-hidden="true"
        onMouseEnter={() => {
          if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
        }}
        onMouseLeave={() => {
          if (trackRef.current) trackRef.current.style.animationPlayState = "running";
        }}
      >
        <div className={`pointer-events-none absolute inset-y-0 start-0 z-10 w-10 bg-gradient-to-l ${fadeFrom} to-transparent sm:w-14`} />
        <div className={`pointer-events-none absolute inset-y-0 end-0 z-10 w-10 bg-gradient-to-r ${fadeFrom} to-transparent sm:w-14`} />
        <div ref={trackRef} className="logo-marquee-track inline-flex w-max flex-nowrap items-center">
          <div ref={setRef} className="marquee-set inline-flex shrink-0 items-center gap-4 sm:gap-[18px]">
            {logos.map((logo, i) => (
              <LogoCell key={`a-${i}`} logo={logo} decorative />
            ))}
          </div>
          <div className="marquee-set inline-flex shrink-0 items-center gap-4 sm:gap-[18px]">
            {logos.map((logo, i) => (
              <LogoCell key={`b-${i}`} logo={logo} decorative />
            ))}
          </div>
          <div className="marquee-set inline-flex shrink-0 items-center gap-4 sm:gap-[18px]">
            {logos.map((logo, i) => (
              <LogoCell key={`c-${i}`} logo={logo} decorative />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
