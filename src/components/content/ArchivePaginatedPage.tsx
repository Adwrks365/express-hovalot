import type { Metadata } from "next";
import { ArchivePageLayout } from "@/components/content/ArchivePageLayout";
import { getArchiveSeo, parseArchivePath } from "@/lib/archives";
import { getContractByPath } from "@/lib/content-registry";
import { buildMetadata } from "@/lib/seo";
import { canonicalPathname } from "@/lib/paths";

export function archiveMetadata(publicPath: string): Metadata {
  const archive = parseArchivePath(publicPath)!;
  const seo = getArchiveSeo(archive);
  const contract = getContractByPath(`${publicPath}/`);
  return buildMetadata(
    {
      title: seo.title,
      description: seo.description,
      canonical: contract?.expectedCanonical || seo.canonical,
      robots: seo.robots,
    },
    canonicalPathname(`${publicPath}/`),
  );
}

export function ArchivePaginatedPage({ path }: { path: string }) {
  const archive = parseArchivePath(path)!;
  return <ArchivePageLayout archive={archive} />;
}
