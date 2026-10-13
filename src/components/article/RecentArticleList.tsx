import Image from "next/image";
import Link from "next/link";
import type { ArticleListItem } from "@/lib/article-utils";
import { normalizePathname } from "@/lib/paths";

export function RecentArticleList({ items }: { items: ArticleListItem[] }) {
  if (!items.length) return null;

  return (
    <section aria-labelledby="recent-articles-heading">
      <h2 id="recent-articles-heading" className="mb-3 text-base font-bold text-brand-900">
        מאמרים אחרונים
      </h2>
      <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
        {items.map((post) => (
          <li key={post.id}>
            <Link
              href={`${normalizePathname(post.path)}/`}
              className="flex gap-3 p-3 transition hover:bg-brand-50/40"
            >
              <div className="relative h-[60px] w-20 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-brand-600">אקספרס</div>
                )}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <span className="line-clamp-3 text-sm font-semibold leading-snug text-brand-900">
                  {post.title}
                </span>
                {post.date ? (
                  <time dateTime={post.date} className="mt-1 block text-xs text-neutral-500">
                    {new Date(post.date).toLocaleDateString("he-IL")}
                  </time>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
