import Image from "next/image";
import { MEDIA } from "@/config/media-paths";
import { homepageTrustBlock } from "@/content/homepage-content";
import { TrustTruckMotion } from "@/components/home/TrustTruckMotion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/** Elementor post-2701 section 22e046e — bg 3516 + foreground truck 3517, layered safe zones. */
export function TrustBlockSection() {
  return (
    <section
      id="trust-truck"
      className="relative w-full overflow-hidden"
      aria-labelledby="trust-truck-headline"
    >
      {/* Background layer — production rekareka landscape (wp-image-3516) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={MEDIA.trustBackground}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-l from-black/25 via-transparent to-transparent lg:from-black/25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/35 via-transparent to-black/10 lg:hidden"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[100rem]">
        {/* Desktop height anchor */}
        <div className="hidden min-h-[560px] lg:block" aria-hidden="true" />

        {/* Text safe zone — upper-right; truck must not enter this region */}
        <div className="relative z-20 px-4 pb-2 pt-8 text-start sm:px-6 sm:pb-3 sm:pt-10 lg:absolute lg:inset-x-0 lg:top-0 lg:h-[38%] lg:max-h-[210px] lg:px-0 lg:pb-0 lg:pt-[49px]">
          <ScrollReveal variant="heading" className="lg:absolute lg:end-[16%] lg:w-[57%] lg:max-w-[720px] xl:end-[18%]">
            <h3 className="text-xl font-bold leading-tight text-brand-900 sm:text-2xl lg:text-[clamp(2rem,3.2vw,3.4375rem)] lg:leading-[1.1]">
              {homepageTrustBlock.brandLine}
            </h3>
            <h2
              id="trust-truck-headline"
              className="mt-2 text-2xl font-bold leading-tight text-white drop-shadow-[2px_1px_4px_rgba(0,0,0,0.45)] sm:text-3xl lg:mt-3 lg:text-[clamp(2.25rem,3.8vw,3.4375rem)] lg:leading-[1.1] lg:drop-shadow-[4px_1px_2px_rgba(0,0,0,0.42)]"
            >
              {homepageTrustBlock.headline}
            </h2>
          </ScrollReveal>
        </div>

        {/* Truck safe zone — lower-left; height clamped so image cannot bleed into text zone */}
        <div className="relative z-10 mx-auto w-full max-w-[min(88vw,520px)] px-2 pb-6 pt-1 sm:px-4 sm:pb-8 lg:absolute lg:bottom-0 lg:left-[-2%] lg:mx-0 lg:flex lg:h-[min(44%,255px)] lg:max-h-[255px] lg:max-w-[620px] lg:w-[min(40vw,620px)] lg:items-end lg:px-0 lg:pb-0 lg:pt-0 xl:w-[min(41vw,620px)]">
          <TrustTruckMotion src={homepageTrustBlock.image} alt={homepageTrustBlock.imageAlt} />
        </div>
      </div>
    </section>
  );
}
