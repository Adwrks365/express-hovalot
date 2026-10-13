import type { Metadata } from "next";
import { CalculatorJumpCta } from "@/components/home/CalculatorJumpCta";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AboutSection } from "@/components/home/AboutSection";
import { CalculatorSection } from "@/components/home/CalculatorSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ClientLogosSection } from "@/components/home/ClientLogosSection";
import { TrustBlockSection } from "@/components/home/TrustBlockSection";
import { FaqSection } from "@/components/home/FaqSection";
import { ServiceAreasSection } from "@/components/home/ServiceAreasSection";
import { CtaSection } from "@/components/home/CtaSection";
import { PopupHomeRegistrar } from "@/components/popups/PopupPageRegistrar";
import { homepageSeo, homepageFaq } from "@/content/homepage-content";
import { buildMetadata } from "@/lib/seo";
import { enhanceSeoFields } from "@/lib/seo-enhance";
import { faqPageSchema, jsonLd } from "@/lib/schema";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata(
  enhanceSeoFields(
    {
      title: homepageSeo.title,
      description: homepageSeo.description,
      canonical: homepageSeo.canonical,
    },
    "/",
  ),
  "/",
);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageSchema(homepageFaq)) }}
      />
      <HeroSection />
      <CalculatorJumpCta />
      <ServicesSection />
      <ReviewsSection />
      <div
        aria-hidden="true"
        data-reviews-truck-separator
        className="h-8 bg-white sm:h-9 lg:h-14"
      />
      <TrustBlockSection />
      <ClientLogosSection />
      <AboutSection />
      <FaqSection />
      <CalculatorSection />
      <ServiceAreasSection />
      <CtaSection />
      <PopupHomeRegistrar title={homepageSeo.title} />
    </>
  );
}
