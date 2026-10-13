import type { Metadata } from "next";
import { ArchivePageLayout } from "@/components/content/ArchivePageLayout";
import { getArchiveSeo, parseArchivePath } from "@/lib/archives";
import { getContractByPath } from "@/lib/content-registry";
import { buildMetadata } from "@/lib/seo";
import { enhanceSeoFields } from "@/lib/seo-enhance";
import { canonicalPathname } from "@/lib/paths";
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = ["moving-by-region", "moving-tips", "moving-services", "prices-costs"];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/category/${slug}`;
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

export default async function CategoryArchivePage({ params }: Props) {
  const { slug } = await params;
  const archive = parseArchivePath(`/category/${slug}`)!;
  return <ArchivePageLayout archive={archive} />;
}
