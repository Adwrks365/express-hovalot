import Image from "next/image";
import Link from "next/link";
import { homepageServices, homepageServicesIntro } from "@/content/homepage-content";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionPad } from "@/lib/layout";

export function ServicesSection() {
  return (
    <section className={`bg-white ${sectionPad.normal}`}>
      <Container>
        <ScrollReveal variant="heading">
          <SectionHeading
            title="השירותים המקצועיים של אקספרס הובלות"
            subtitle={homepageServicesIntro}
            subtitleClassName="md:hidden"
          />
        </ScrollReveal>
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10">
          {homepageServices.map((service, index) => (
            <ScrollReveal
              key={service.href}
              variant="card"
              delayMs={index * 60}
              as="article"
              className="group flex h-full flex-col items-center text-center lg:items-stretch lg:text-start"
            >
              <div className="relative mx-auto mb-5 flex w-full flex-col items-center lg:block">
                <div className="relative z-10 -mb-7 flex justify-center lg:absolute lg:start-[calc(5%+0.5rem)] lg:top-0 lg:mb-0 lg:-translate-y-1/3 lg:justify-start">
                  <div className="relative h-16 w-16 sm:h-[4.125rem] sm:w-[4.125rem] lg:h-[4.125rem] lg:w-16">
                    <Image
                      src={service.badge}
                      alt=""
                      fill
                      className="object-contain drop-shadow-md"
                      sizes="64px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="relative aspect-[4/3] w-[90%] max-w-[320px] overflow-hidden rounded-[20px] bg-neutral-100 shadow-sm sm:max-h-[230px] lg:max-h-[240px]">
                  <Image
                    src={service.photo}
                    alt={service.alt}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 640px) 88vw, (max-width: 1280px) 42vw, 28vw"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold leading-snug text-brand-800 sm:text-xl">
                <Link href={service.href} className="transition-colors hover:text-brand-600">
                  {service.title}
                </Link>
              </h3>
              <p className="mx-auto mt-3 max-w-md flex-1 text-base leading-relaxed text-neutral-600 lg:mx-0 lg:max-w-none">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="mt-3 inline-flex items-center justify-center gap-1 text-sm font-medium text-brand-600 transition hover:text-brand-800 lg:justify-start"
              >
                קראו עוד ←
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/שירותי-הובלה"
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-2.5 text-base font-bold text-brand-700 shadow-card transition hover:border-brand-500 hover:bg-brand-50"
          >
            קרא עוד »
          </Link>
        </div>
      </Container>
    </section>
  );
}
