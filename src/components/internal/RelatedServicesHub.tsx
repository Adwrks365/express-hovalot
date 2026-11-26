import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { canonicalPathname } from "@/lib/paths";

type HubLink = { href: string; label: string };

const DEFAULT_HUB: HubLink[] = [
  { href: "/", label: "חברת הובלות בירושלים" },
  { href: "/שירותי-הובלה/", label: "כל שירותי ההובלה" },
];

const BY_PATH_PREFIX: { prefix: string; links: HubLink[] }[] = [
  {
    prefix: "/הובלת-דירה",
    links: [
      { href: "/מחירי-הובלת-דירות/", label: "מחירי הובלת דירות" },
      { href: "/חברת-אריזה-והובלה-בירושלים/", label: "אריזה והובלה" },
      { href: "/הובלות-משרדים-בירושלים/", label: "הובלות משרדים" },
      { href: "/מדריך-מעבר-דירה-ירושלים/", label: "מדריך מעבר דירה" },
    ],
  },
  {
    prefix: "/הובלות-משרדים",
    links: [
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה בירושלים" },
      { href: "/חברת-אריזה-והובלה-בירושלים/", label: "אריזה והובלה" },
      { href: "/מחירי-הובלת-דירות/", label: "מחירון הובלות" },
    ],
  },
  {
    prefix: "/מחירי-הובלת",
    links: [
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה בירושלים" },
      { href: "/הובלות-משרדים-בירושלים/", label: "הובלות משרדים" },
      { href: "/חברת-אריזה-והובלה-בירושלים/", label: "שירותי אריזה" },
    ],
  },
  {
    prefix: "/הובלות-קטנות",
    links: [
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה" },
      { href: "/מחירי-הובלת-דירות/", label: "מחירון הובלות" },
    ],
  },
  {
    prefix: "/חברת-הובלות-מומלצת",
    links: [
      { href: "/", label: "אקספרס הובלות — דף הבית" },
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה" },
      { href: "/מחירי-הובלת-דירות/", label: "מחירון הובלות" },
    ],
  },
  {
    prefix: "/הובלת-משטחים-בירושלים",
    links: [
      { href: "/הובלת-משטחים-במרכז/", label: "הובלת משטחים במרכז" },
      { href: "/אחסון-משטחים/", label: "אחסון משטחים" },
      { href: "/הצעת-מחיר/", label: "הצעת מחיר" },
    ],
  },
  {
    prefix: "/הובלת-משטחים-במרכז",
    links: [
      { href: "/הובלת-משטחים-בירושלים/", label: "הובלת משטחים בירושלים" },
      { href: "/אחסון-משטחים/", label: "אחסון משטחים" },
      { href: "/הצעת-מחיר/", label: "הצעת מחיר" },
    ],
  },
  {
    prefix: "/אחסון-משטחים",
    links: [
      { href: "/הובלת-משטחים-בירושלים/", label: "הובלת משטחים בירושלים" },
      { href: "/הובלת-משטחים-במרכז/", label: "הובלת משטחים במרכז" },
      { href: "/הצעת-מחיר/", label: "הצעת מחיר" },
    ],
  },
  {
    prefix: "/הובלות-באזור-ירושלים",
    links: [
      { href: "/", label: "הובלות בירושלים — דף הבית" },
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה בירושלים" },
      { href: "/הובלות-בירושלים/", label: "מדריך הובלות בירושלים" },
    ],
  },
  {
    prefix: "/חברת-אריזה",
    links: [
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה בירושלים" },
      { href: "/אחסון-תכולה-בירושלים/", label: "אחסון תכולה" },
    ],
  },
  {
    prefix: "/אחסון",
    links: [
      { href: "/הובלת-דירה-בירושלים/", label: "הובלת דירה" },
      { href: "/שירותי-הובלה/", label: "שירותי הובלה" },
    ],
  },
  {
    prefix: "/הובלות-ב",
    links: [
      { href: "/הובלת-דירה-מירושלים/", label: "הובלת דירה מירושלים" },
      { href: "/שירותי-הובלה/", label: "שירותי הובלה" },
    ],
  },
];

function linksForPath(path: string): HubLink[] {
  const p = canonicalPathname(path);
  let links: HubLink[];
  for (const row of BY_PATH_PREFIX) {
    if (p.startsWith(row.prefix)) {
      links = [...row.links, ...DEFAULT_HUB.filter((d) => !row.links.some((l) => l.href === d.href))].slice(0, 5);
      break;
    }
  }
  links ??= [...DEFAULT_HUB];

  const seen = new Set<string>();
  return links.filter((l) => {
    const href = canonicalPathname(l.href);
    if (href === p || seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

export function RelatedServicesHub({ path }: { path: string }) {
  const links = linksForPath(path);
  if (links.length < 2) return null;

  return (
    <section className="border-t border-brand-100 bg-brand-50/60 py-10" aria-labelledby="related-services-heading">
      <Container>
        <h2 id="related-services-heading" className="text-lg font-bold text-brand-900">
          שירותים קשורים
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                prefetch={false}
                className="inline-flex rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm transition hover:border-brand-400 hover:text-brand-900"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
