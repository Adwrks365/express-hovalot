import Image from "next/image";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { ProseBody } from "@/components/structured-content/ProseBody";
import { SectionIntro } from "@/components/structured-content/SectionIntro";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { gridClass } from "@/lib/layout";
import type { ContentLink, ProseContent } from "@/lib/structured-content/types";

export function StructuredImageTextSection({
  heading,
  image,
  imageAlt,
  body,
  links = [],
  imagePosition = "start",
  tone = "white",
}: {
  heading?: string | null;
  image: string;
  imageAlt: string;
  body: ProseContent;
  links?: ContentLink[];
  imagePosition?: "start" | "end";
  tone?: SectionTone;
}) {
  const imageBlock = (
    <ScrollReveal variant="image" className="min-w-0 w-full">
      <div className="relative aspect-[4/3] w-full min-h-[220px] overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-100 shadow-soft sm:min-h-[260px] lg:min-h-[320px] lg:aspect-[5/4]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 540px"
        />
      </div>
    </ScrollReveal>
  );

  const textBlock = (
    <div className="min-w-0 w-full">
      <SectionIntro heading={heading} intro={null} />
      <ProseBody content={body} links={links} />
    </div>
  );

  return (
    <SectionShell tone={tone}>
      <Container width="standard">
        <div
          className={`${gridClass.split} ${imagePosition === "end" ? "lg:[&>*:first-child]:order-2" : ""}`}
        >
          {imageBlock}
          <ScrollReveal variant="subtle">{textBlock}</ScrollReveal>
        </div>
      </Container>
    </SectionShell>
  );
}
