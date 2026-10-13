import { SITE_URL } from "@/lib/constants";
import { canonicalPathname } from "@/lib/paths";
import type { ContentRecord } from "@/lib/content-registry";
import type { ArchiveMatch } from "@/lib/archives";
import { getArchiveTitle } from "@/lib/archives";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export function breadcrumbsForContent(record: ContentRecord): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "דף הבית", href: "/" }];

  if (record.template === "article") {
    items.push({ label: "טיפים ומידע", href: "/blog/" });
    items.push({ label: record.title, href: `${canonicalPathname(record.path)}` });
    return items;
  }

  if (record.template === "service") {
    items.push({ label: "שירותי הובלה", href: "/שירותי-הובלה/" });
    items.push({ label: record.title, href: `${canonicalPathname(record.path)}` });
    return items;
  }

  if (record.template === "location") {
    items.push({ label: "שירותי הובלה", href: "/שירותי-הובלה/" });
    items.push({ label: record.title, href: `${canonicalPathname(record.path)}` });
    return items;
  }

  if (record.template === "blog-index") {
    items.push({ label: record.title, href: "/blog/" });
    return items;
  }

  items.push({ label: record.title, href: `${canonicalPathname(record.path)}` });
  return items;
}

export function breadcrumbsForArchive(archive: ArchiveMatch): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "דף הבית", href: "/" }];

  if (archive.kind === "category") {
    items.push({ label: "טיפים ומידע", href: "/blog/" });
    items.push({
      label: getArchiveTitle(archive),
      href: `/category/${archive.slug}/`,
    });
    return items;
  }

  items.push({
    label: getArchiveTitle(archive),
    href: archive.kind === "tag"
      ? `/tag/${archive.slug}/`
      : `/author/${archive.authorSlug}/`,
  });
  return items;
}

export function jsonLd(items: BreadcrumbItem[]) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href === "/" ? "/" : item.href}` } : {}),
    })),
  };
  return JSON.stringify(data);
}
