import { AboutCompanyBlock } from "@/components/article/AboutCompanyBlock";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticlePrevNext } from "@/components/article/ArticlePrevNext";
import { ArticleSidebar } from "@/components/article/ArticleSidebar";
import { TableOfContents } from "@/components/article/TableOfContents";
import { PopupPageRegistrar } from "@/components/popups/PopupPageRegistrar";
import { InternalPageShell } from "@/components/internal/InternalPageShell";
import { RedesignConversion } from "@/components/redesign/RedesignConversion";
import { Container } from "@/components/ui/Container";
import type { ContentRecord } from "@/lib/content-registry";
import { breadcrumbsForContent } from "@/lib/breadcrumbs";
import { sectionPad } from "@/lib/layout";
import { wpUrlToLocal } from "@/lib/media";
import { parseArticleBody } from "@/lib/redesign/article";
import {
  getArticleNeighbors,
  getAuthorInfo,
  getPrimaryCategory,
  getRecentArticles,
  getSidebarCategories,
} from "@/lib/article-utils";

export function ArticlePageLayout({ record }: { record: ContentRecord }) {
  const breadcrumbs = breadcrumbsForContent(record);
  const author = getAuthorInfo(record);
  const category = getPrimaryCategory(record);
  const featuredImage = record.featuredImage ? wpUrlToLocal(record.featuredImage) : null;
  const { parts, toc } = parseArticleBody(record.contentHtml, { title: record.title, featuredImage });
  const { prev, next } = getArticleNeighbors(record.path);
  const recent = getRecentArticles(record.path, 6);
  const categories = getSidebarCategories();

  return (
    <InternalPageShell debug={{ archetype: "REDESIGN_ARTICLE", renderer: "RedesignArticleLayout", rawFallback: false, structuredBlockCount: toc.length }}>
      <ArticleHero
        title={record.title}
        breadcrumbs={breadcrumbs}
        category={category}
        authorName={author.name}
        authorPath={`${author.archivePath}/`}
        published={record.date}
        modified={record.modified}
        featuredImage={featuredImage}
      />

      <Container width="standard" className={sectionPad.compact}>
        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,330px)] lg:gap-12">
          <article className="min-w-0 w-full">
            <div className="space-y-6 sm:space-y-8">
              <TableOfContents items={toc} />
              <ArticleBody parts={parts} />
            </div>
            <div data-redesign-chrome className="mt-10 space-y-6 border-t border-neutral-200 pt-8 sm:mt-12 sm:space-y-8 sm:pt-10">
              <AboutCompanyBlock />
              <ArticlePrevNext prev={prev} next={next} />
            </div>
          </article>

          <aside data-redesign-chrome className="min-w-0 w-full lg:max-w-[330px]">
            <div className="lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:self-start">
              <ArticleSidebar recent={recent} categories={categories} />
            </div>
          </aside>
        </div>
      </Container>
      <RedesignConversion />
      <PopupPageRegistrar record={record} />
    </InternalPageShell>
  );
}
