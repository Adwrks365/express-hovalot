import Link from "next/link";
import { PopupArchiveRegistrar } from "@/components/popups/PopupPageRegistrar";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import { ArticleCard, type ArticleCardData } from "@/components/internal/ArticleCard";
import { RedesignHero } from "@/components/redesign/RedesignHero";
import { RedesignSection } from "@/components/redesign/Section";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  getArchiveBasePath,
  getArchivePageCount,
  getArchivePosts,
  getArchiveTitle,
  type ArchiveMatch,
} from "@/lib/archives";
import { breadcrumbsForArchive } from "@/lib/breadcrumbs";
import { normalizePathname } from "@/lib/paths";

export function ArchivePageLayout({ archive }: { archive: ArchiveMatch }) {
  const posts = getArchivePosts(archive) as ArticleCardData[];
  const breadcrumbs = breadcrumbsForArchive(archive);
  const pageNum = archive.page && archive.page > 1 ? archive.page : null;
  const title = pageNum ? `${getArchiveTitle(archive)} — עמוד ${pageNum}` : getArchiveTitle(archive);
  const pageCount = getArchivePageCount(archive);
  const currentPage = archive.page || 1;
  const basePath = normalizePathname(getArchiveBasePath(archive));

  return (
    <InternalPageShell debug={{ archetype: "REDESIGN_ARCHIVE", renderer: "RedesignArchive", rawFallback: false, structuredBlockCount: posts.length }}>
      <RedesignHero
        hero={{ title, eyebrow: null, subtitles: [], lead: [], buttons: [], image: null, icon: null, badges: [], background: null }}
        breadcrumbs={breadcrumbs}
        compact
        aside="none"
      />
      <RedesignSection tone="mist" kind="archive-posts">
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} variant="card" delayMs={(index % 3) * 60}>
                <ArticleCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">לא נמצאו מאמרים בארכיון זה.</p>
        )}
        {pageCount > 1 ? (
          <nav aria-label="ניווט בין עמודי הארכיון" className="mt-10 flex justify-center gap-2 text-sm">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
              n === currentPage ? (
                <span
                  key={n}
                  aria-current="page"
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-brand-700 px-4 font-semibold text-white"
                >
                  {n}
                </span>
              ) : (
                <Link
                  key={n}
                  href={n === 1 ? `${basePath}/` : `${basePath}/page/${n}/`}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-brand-200 bg-white px-4 font-semibold text-brand-700 shadow-card hover:border-brand-500"
                >
                  {n}
                </Link>
              ),
            )}
          </nav>
        ) : null}
      </RedesignSection>
      <PopupArchiveRegistrar path={basePath} title={title} />
    </InternalPageShell>
  );
}
