import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArchivePageLayout } from "@/components/content/ArchivePageLayout";
import { ArticlePageLayout } from "@/components/internal/ArticlePageLayout";
import { BlogIndexLayout } from "@/components/internal/BlogIndexLayout";
import { ServicePageLayout } from "@/components/internal/ServicePageLayout";
import { StandardPageLayout } from "@/components/internal/StandardPageLayout";
import { getArchiveSeo } from "@/lib/archives";
import {
  getAllRoutablePaths,
  getContractByPath,
  resolveRoute,
} from "@/lib/content-registry";
import { buildMetadata } from "@/lib/seo";
import { enhanceSeoFields } from "@/lib/seo-enhance";
import { articleSchema, jsonLd } from "@/lib/schema";
import { slugArrayToPath, pathToSlugArray, canonicalPathname } from "@/lib/paths";
import { wpUrlToLocal } from "@/lib/media";
export const revalidate = 3600;
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  return getAllRoutablePaths().map((path) => ({
    slug: pathToSlugArray(path),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slugArrayToPath(slug);
  const resolved = resolveRoute(path);

  if (resolved.kind === "redirect") {
    return {};
  }

  if (resolved.kind === "content") {
    const { record } = resolved;
    const seo = enhanceSeoFields(
      {
        title: record.seo.title || record.title,
        description: record.seo.description,
        canonical: record.seo.canonical,
        ogImage: record.seo.ogImage ? (wpUrlToLocal(record.seo.ogImage) ?? undefined) : undefined,
        robots: record.seo.robots,
      },
      canonicalPathname(record.path),
    );
    return buildMetadata(seo, canonicalPathname(record.path));
  }

  if (resolved.kind === "archive") {
    const seo = getArchiveSeo(resolved.archive);
    const contract = getContractByPath(path);
    const enhanced = enhanceSeoFields(
      {
        title: seo.title,
        description: seo.description,
        canonical: contract?.expectedCanonical || seo.canonical,
        robots: seo.robots,
      },
      canonicalPathname(path),
    );
    return buildMetadata(enhanced, canonicalPathname(path));
  }

  return {};
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slugArrayToPath(slug);
  const resolved = resolveRoute(path);

  if (resolved.kind === "redirect") {
    redirect(resolved.destination);
  }

  if (resolved.kind === "archive") {
    return <ArchivePageLayout archive={resolved.archive} />;
  }

  if (resolved.kind === "content") {
    const { record } = resolved;

    if (record.template === "article") {
      const schema = articleSchema({
        title: record.title,
        description: record.seo.description,
        path: record.path,
        datePublished: record.date,
        dateModified: record.modified,
        image: record.featuredImage || record.seo.ogImage,
      });

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
          />
          <ArticlePageLayout record={record} />
        </>
      );
    }

    if (record.template === "blog-index") {
      return <BlogIndexLayout record={record} />;
    }

    if (record.template === "service" || record.template === "location") {
      return <ServicePageLayout record={record} />;
    }

    return <StandardPageLayout record={record} />;
  }

  notFound();
}
