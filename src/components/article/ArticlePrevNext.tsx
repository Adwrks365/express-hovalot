import Image from "next/image";
import Link from "next/link";
import type { ArticleNeighbor } from "@/lib/article-utils";

function NavCard({
  label,
  item,
  align = "start",
}: {
  label: string;
  item: ArticleNeighbor;
  align?: "start" | "end";
}) {
  return (
    <Link
      href={`${item.path}/`}
      className={`group flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-brand-200 ${align === "end" ? "sm:flex-row-reverse sm:text-end" : ""}`}
    >
      {item.featuredImage ? (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-50">
          <Image src={item.featuredImage} alt="" fill className="object-cover" sizes="96px" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        <span className="mt-1 block font-semibold leading-snug text-brand-900 group-hover:text-brand-600">
          {item.title}
        </span>
      </div>
    </Link>
  );
}

export function ArticlePrevNext({
  prev,
  next,
}: {
  prev: ArticleNeighbor | null;
  next: ArticleNeighbor | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="ניווט מאמרים" className="grid gap-4 sm:grid-cols-2">
      {prev ? <NavCard label="מאמר קודם" item={prev} /> : <div className="hidden sm:block" />}
      {next ? <NavCard label="מאמר הבא" item={next} align="end" /> : null}
    </nav>
  );
}
