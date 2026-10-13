import Image from "next/image";
import { homepageAbout } from "@/content/homepage-content";
import { Container } from "@/components/ui/Container";
import { LinkedText } from "@/components/ui/LinkedText";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sectionPad } from "@/lib/layout";
import { sectionTitleClass } from "@/lib/ui-tokens";

export function AboutSection() {
  return (
    <section className={`bg-neutral-50/60 ${sectionPad.normal}`}>
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <ScrollReveal variant="slide-start" className="order-2 lg:order-1">
            <div className="text-start">
              <h2 className={sectionTitleClass}>{homepageAbout.title}</h2>
              <div className="mt-5 max-w-prose space-y-4 text-base leading-[1.8] text-neutral-700 sm:text-lg">
                {homepageAbout.paragraphs.map((p, i) => (
                  <p key={p.slice(0, 32)}>
                    <LinkedText text={p} links={homepageAbout.links[i]} />
                  </p>
                ))}
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="slide-end" className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-[4/3] max-w-lg overflow-hidden rounded-2xl shadow-soft lg:mx-0 lg:max-w-none lg:aspect-[5/4]">
              <Image
                src={homepageAbout.image}
                alt="צוות אקספרס הובלות בירושלים"
                fill
                className="object-cover object-[center_20%]"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
