import Image from "next/image";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionIntro } from "@/components/structured-content/SectionIntro";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { gridClass } from "@/lib/layout";
import { radius, motion as uiMotion } from "@/lib/ui-tokens";
import type { ProseContent } from "@/lib/structured-content/types";

type ServiceCard = {
  title: string;
  description: string;
  image: string | null;
  imageAlt: string;
  href?: string | null;
};

export function ServiceCardsSection({
  heading,
  intro,
  cards,
  tone = "muted",
}: {
  heading?: string | null;
  intro?: ProseContent | null;
  cards: ServiceCard[];
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone}>
      <Container width="standard">
        <ScrollReveal variant="heading">
          <SectionIntro heading={heading} intro={intro} />
        </ScrollReveal>
        <div className={gridClass.feature}>
          {cards.map((card) => (
            <ScrollReveal key={card.title} variant="card">
              <article
                className={`flex h-full flex-col overflow-hidden border border-neutral-200/90 bg-white shadow-soft ${radius.panel} ${uiMotion.card} hover:-translate-y-0.5 hover:shadow-elevated motion-reduce:hover:translate-none`}
              >
                {card.image ? (
                  <div className="relative aspect-[16/10] bg-neutral-100">
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 380px"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-brand-900 sm:text-xl">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    {card.description}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
