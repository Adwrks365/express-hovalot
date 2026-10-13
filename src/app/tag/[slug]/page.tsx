import type { Metadata } from "next";
import { ArchivePageLayout } from "@/components/content/ArchivePageLayout";
import { getArchiveSeo, parseArchivePath } from "@/lib/archives";
import { getContractByPath } from "@/lib/content-registry";
import { buildMetadata } from "@/lib/seo";
import { enhanceSeoFields } from "@/lib/seo-enhance";
import { canonicalPathname, decodePathSegment } from "@/lib/paths";
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [
    { slug: "הובלות-בירושלים" },
    { slug: "הובלות-קטנות" },
    { slug: "מעבר-דירה" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodePathSegment(slug);
  const path = `/tag/${decoded}`;
  const archive = parseArchivePath(path)!;
  const seo = getArchiveSeo(archive);
  const contract = getContractByPath(path);
  return buildMetadata(
    enhanceSeoFields(
      { title: seo.title, description: seo.description, canonical: contract?.expectedCanonical || seo.canonical, robots: seo.robots },
      canonicalPathname(path),
    ),
    canonicalPathname(path),
  );
}

export default async function TagArchivePage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodePathSegment(slug);
  const archive = parseArchivePath(`/tag/${decoded}`)!;
  return <ArchivePageLayout archive={archive} />;
}
