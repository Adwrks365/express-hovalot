import { Container } from "@/components/ui/Container";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sectionPad } from "@/lib/layout";
import { sectionTitleClass } from "@/lib/ui-tokens";

export function ClientLogosSection() {
  return (
    <section
      className={`border-t border-neutral-100 bg-white ${sectionPad.normal}`}
      aria-labelledby="logos-heading"
    >
      <Container>
        <ScrollReveal variant="heading">
          <h2 id="logos-heading" className={`mb-8 text-center ${sectionTitleClass}`}>
            לקוחות שבחרו באקספרס הובלות
          </h2>
        </ScrollReveal>
        <div className="-mx-4 overflow-x-clip sm:-mx-6 lg:-mx-8">
          <ClientLogoMarquee />
        </div>
      </Container>
    </section>
  );
}
