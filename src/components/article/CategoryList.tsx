import Link from "next/link";
import type { CategoryListItem } from "@/lib/article-utils";

export function CategoryList({ items }: { items: CategoryListItem[] }) {
  if (!items.length) return null;

  return (
    <section aria-labelledby="article-categories-heading">
      <h2 id="article-categories-heading" className="mb-3 text-base font-bold text-brand-900">
        קטגוריות
      </h2>
      <ul className="rounded-xl border border-neutral-200 bg-white px-1 py-1">
        {items.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/category/${cat.slug}/`}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-brand-50/50 hover:text-brand-800"
            >
              <span>{cat.name}</span>
              {cat.count > 0 ? (
                <span className="shrink-0 text-xs text-neutral-400">({cat.count})</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
