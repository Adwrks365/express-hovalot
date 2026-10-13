import Link from "next/link";
import { homepageFaq } from "@/content/homepage-content";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { Container } from "@/components/ui/Container";
import { ContentWidth } from "@/components/ui/ContentWidth";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sectionPad } from "@/lib/layout";

export function FaqSection() {
  return (
    <section className={`bg-white ${sectionPad.normal}`}>
      <Container>
        <ContentWidth>
          <ScrollReveal variant="heading">
            <SectionHeading
              title={
                <Link href="/הובלות-בירושלים" className="transition-colors hover:text-brand-600">
                  שאלות ותשובות נפוצות: כל מה שצריך לדעת לפני הובלה בירושלים
                </Link>
              }
              align="center"
              className="mb-8 max-w-none"
            />
          </ScrollReveal>
          <FaqAccordion items={homepageFaq} />
        </ContentWidth>
      </Container>
    </section>
  );
}
