import Image from "next/image";
import { MEDIA } from "@/config/media-paths";
import {
  footerAbout,
  footerContact,
  footerCredits,
  footerExternalResources,
  footerLegalLinks,
  footerMapEmbedSrc,
  footerMiniFormContent,
  footerNavEntries,
  footerServiceAreas,
} from "@/config/footer-content";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FooterAccordionGroup } from "@/components/layout/FooterAccordionGroup";
import { FooterLink } from "@/components/layout/FooterLink";
import { FooterMiniForm } from "@/components/forms/FooterMiniForm";
import { FooterSocialIcons } from "@/components/layout/FooterSocialIcons";
import { Logo } from "@/components/layout/Logo";

function FooterColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center text-sm font-bold text-accent sm:text-base lg:text-start">
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-brand-800/80 bg-brand-950 text-neutral-100">
      <div className="absolute inset-0 opacity-[0.18]">
        <Image src={MEDIA.footerBg} alt="" fill className="object-cover" aria-hidden="true" />
      </div>
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(19,51,14,0.35),transparent_55%),linear-gradient(180deg,rgba(8,24,6,0.92),rgba(8,24,6,0.97))]"
        aria-hidden="true"
      />

      <Container className="relative py-8 lg:py-9">
        <ScrollReveal variant="subtle">
          <div
            data-footer-main
            className="grid items-start gap-6 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:text-start"
          >
            {/* Col 1 — logo, about, social */}
            <div className="flex flex-col items-center space-y-2.5 lg:items-start">
              <Logo variant="footer" />
              <FooterColumnHeading>{footerAbout.title}</FooterColumnHeading>
              <p className="max-w-md text-[14px] leading-snug text-neutral-300 lg:max-w-none">
                {footerAbout.description}
              </p>
              <FooterSocialIcons />
            </div>

            {/* Col 2 — contact, service areas, Jerusalem links */}
            <div className="space-y-3">
              <div>
                <FooterColumnHeading>{footerContact.title}</FooterColumnHeading>
                <p className="mb-1.5 text-[14px] font-semibold text-white">{footerContact.officeTitle}</p>
                <ul className="space-y-0.5 text-[14px] leading-snug text-neutral-300">
                  <li>{footerContact.address}</li>
                  <li>
                    <FooterLink href={footerContact.phoneHref}>{footerContact.phone}</FooterLink>
                  </li>
                  <li>
                    <FooterLink href={`mailto:${footerContact.email}`} dir="ltr">
                      {footerContact.email}
                    </FooterLink>
                  </li>
                </ul>
              </div>

              <div>
                <FooterColumnHeading>אזורי שירות מובילים</FooterColumnHeading>
                <p className="text-[14px] leading-snug text-neutral-300">
                  {footerServiceAreas.map((area, i) => (
                    <span key={area.href}>
                      {i > 0 && ", "}
                      <FooterLink href={area.href} className="inline text-neutral-300 hover:text-accent-300">
                        {area.label}
                      </FooterLink>
                    </span>
                  ))}
                  <span> וסביבתם.</span>
                </p>
              </div>

              <div>
                <FooterColumnHeading>קישורים ומידע חיוני בירושלים</FooterColumnHeading>
                <ul className="space-y-0.5">
                  {footerExternalResources.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <FooterLink href={link.href} external>
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Col 3 — collapsible nav (production vertical menu) */}
            <div className="text-center lg:text-start">
              <FooterColumnHeading>ניווט באתר</FooterColumnHeading>
              <nav aria-label="ניווט בפוטר" className="[&_button]:justify-center lg:[&_button]:justify-between">
                {footerNavEntries.map((entry) =>
                  entry.type === "link" ? (
                    <div key={`${entry.label}-${entry.href}`} className="py-0.5">
                      <FooterLink href={entry.href}>{entry.label}</FooterLink>
                    </div>
                  ) : (
                    <FooterAccordionGroup
                      key={entry.id}
                      id={entry.id}
                      label={entry.label}
                      href={entry.href}
                      links={entry.links}
                      defaultOpen={false}
                    />
                  ),
                )}
              </nav>
            </div>

            {/* Col 4 — map + compact footer lead form (FORM-02) */}
            <div className="@container/footercol mx-auto w-full max-w-md space-y-3 lg:mx-0 lg:max-w-none">
              <div className="overflow-hidden rounded-lg border border-white/10">
                <iframe
                  title="מפת משרדי אקספרס הובלות"
                  src={footerMapEmbedSrc}
                  className="h-[190px] w-full border-0 sm:h-[200px] lg:h-[200px] xl:h-[210px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3" data-footer-utility-form>
                <p className="text-sm font-semibold text-white">{footerMiniFormContent.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-neutral-300">
                  {footerMiniFormContent.intro}
                </p>
                <div className="mt-2">
                  <FooterMiniForm />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>

      <div className="relative border-t border-white/10 bg-brand-950/95">
        <Container className="flex flex-col gap-2 pb-32 pt-3 text-[13px] leading-snug text-neutral-300 pe-16 sm:pb-36 md:flex-row md:items-center md:justify-between md:pb-3 md:pe-24">
          <p className="text-center md:text-start">
            {footerCredits.copyright} | {footerCredits.agencyCredit}{" "}
            <FooterLink href={footerCredits.maintenance.href} external className="inline text-neutral-300 hover:text-white">
              {footerCredits.maintenance.label}
            </FooterLink>
          </p>
          <p className="shrink-0 text-center md:text-start">
            {footerLegalLinks.map((link, i) => (
              <span key={link.href}>
                {i > 0 && " | "}
                <FooterLink href={link.href} className="inline text-neutral-300 hover:text-white">
                  {link.label}
                </FooterLink>
              </span>
            ))}
          </p>
        </Container>
      </div>
    </footer>
  );
}
