import Link from "next/link";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AreaLinksSection({
  heading,
  links,
  tone = "muted",
}: {
  heading: string;
  links: { href: string; label: string }[];
  tone?: SectionTone;
}) {
  return (
    <SectionShell tone={tone}>
      <SectionHeading title={heading} align="start" className="mb-6 sm:mb-8" />
      <ul className="flex flex-wrap justify-start gap-2 sm:gap-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="inline-flex min-h-[44px] items-center rounded-full border border-brand-200/80 bg-white px-4 py-2 text-sm font-medium text-brand-800 shadow-sm transition-colors hover:border-brand-400 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
