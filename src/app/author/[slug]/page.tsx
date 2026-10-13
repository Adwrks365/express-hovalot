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
  return [{ slug: "guest_2020" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/author/${slug}`;
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

export default async function AuthorArchivePage({ params }: Props) {
  const { slug } = await params;
  const archive = parseArchivePath(`/author/${slug}`)!;
  return <ArchivePageLayout archive={archive} />;
}
