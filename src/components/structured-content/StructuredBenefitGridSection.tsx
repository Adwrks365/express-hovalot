import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionIntro } from "@/components/structured-content/SectionIntro";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { gridClass } from "@/lib/layout";
import { radius, motion } from "@/lib/ui-tokens";
import { MediaWrapper } from "@/components/layout/MediaWrapper";

export function StructuredBenefitGridSection({
  heading,
  items,
  tone = "muted",
}: {
  heading?: string | null;
  items: { icon?: string | null; title: string; description: string }[];
  tone?: SectionTone;
}) {
  const cols =
    items.length <= 2
      ? "grid gap-5 sm:grid-cols-2"
      : items.length === 3
        ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        : gridClass.feature;

  return (
    <SectionShell tone={tone}>
      <Container width="standard">
        <ScrollReveal variant="heading">
          <SectionIntro heading={heading} intro={null} align="center" />
        </ScrollReveal>
        <div className={cols}>
          {items.map((item) => (
            <ScrollReveal key={item.title} variant="card">
              <article
                className={`flex h-full flex-col ${radius.panel} border border-neutral-200/90 bg-white p-5 text-start shadow-soft sm:p-6 ${motion.card} hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-elevated motion-reduce:hover:translate-none`}
              >
                {item.icon ? (
                  <div className="mb-3 sm:mb-4">
                    <MediaWrapper src={item.icon} role="icon" alt="" />
                  </div>
                ) : null}
                <h3 className="text-base font-bold text-brand-900 sm:text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">{item.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
