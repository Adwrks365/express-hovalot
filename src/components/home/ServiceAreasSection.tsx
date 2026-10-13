import { homepageServiceAreas } from "@/content/homepage-content";
import { Container } from "@/components/ui/Container";
import { LinkedText } from "@/components/ui/LinkedText";
import { ProseWidth } from "@/components/ui/ProseWidth";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sectionPad } from "@/lib/layout";
import { sectionTitleClass } from "@/lib/ui-tokens";

export function ServiceAreasSection() {
  return (
    <section className={`bg-white ${sectionPad.normal}`}>
      <Container>
        <ProseWidth variant="content">
          <ScrollReveal variant="heading">
            <header className="text-center">
              <h2 className={`${sectionTitleClass} text-center`}>{homepageServiceAreas.title}</h2>
              <h3 className="mx-auto mt-2 max-w-2xl text-center text-lg font-semibold text-brand-600">
                {homepageServiceAreas.subtitle}
              </h3>
            </header>
          </ScrollReveal>

          <ScrollReveal variant="subtle">
            <div className="mt-6 space-y-4 text-start text-base leading-[1.8] text-neutral-700 sm:text-lg">
              <p>{homepageServiceAreas.intro}</p>
              <p>{homepageServiceAreas.servicesLine}</p>
            </div>

            <ul className="mt-6 space-y-4 text-base leading-[1.8] text-neutral-800">
              {homepageServiceAreas.areas.map((area) => (
                <li key={area.slice(0, 24)} className="border-s-2 border-brand-200/80 ps-4">
                  {area}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-base leading-[1.8] text-neutral-700 sm:text-lg">
              <LinkedText text={homepageServiceAreas.experience} links={homepageServiceAreas.experienceLinks} />
            </p>
          </ScrollReveal>
        </ProseWidth>
      </Container>
    </section>
  );
}
