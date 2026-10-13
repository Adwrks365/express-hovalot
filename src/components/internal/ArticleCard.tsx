import Image from "next/image";
import Link from "next/link";
import { htmlExcerpt } from "@/lib/wp-html";
import { normalizePathname } from "@/lib/paths";
import { resolveMediaById } from "@/lib/media";
import { AUTHOR } from "@/lib/article-utils";

export type ArticleCardData = {
  id: number;
  path: string;
  title: string;
  date?: string;
  excerptHtml?: string;
  contentHtml?: string;
  featuredMediaId?: number | null;
};

export function ArticleCard({ post }: { post: ArticleCardData }) {
  const href = `${normalizePathname(post.path)}/`;
  const image = resolveMediaById(post.featuredMediaId ?? null);
  const excerpt = post.excerptHtml
    ? htmlExcerpt(post.excerptHtml, 140)
    : post.contentHtml
      ? htmlExcerpt(post.contentHtml, 140)
      : "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-brand-50">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-600">אקספרס הובלות</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-neutral-500">
          {post.date ? (
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("he-IL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          ) : null}
          {post.date ? <span aria-hidden="true">·</span> : null}
          <Link href={`${AUTHOR.archivePath}/`} className="hover:text-brand-600">
            {AUTHOR.name}
          </Link>
        </p>
        <h2 className="mt-2 text-lg font-bold leading-snug text-brand-900 sm:text-xl">
          <Link href={href} className="hover:text-brand-600">
            {post.title}
          </Link>
        </h2>
        {excerpt ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {excerpt}
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-500"
        >
          קראו עוד
          <span aria-hidden="true">←</span>
        </Link>
      </div>
    </article>
  );
}
