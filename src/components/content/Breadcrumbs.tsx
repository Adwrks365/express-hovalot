import Link from "next/link";
import { jsonLd, type BreadcrumbItem } from "@/lib/breadcrumbs";

export type { BreadcrumbItem };

export function Breadcrumbs({
  items,
  variant = "light",
}: {
  items: BreadcrumbItem[];
  variant?: "light" | "onDark";
}) {
  if (items.length <= 1) return null;

  const linkClass =
    variant === "onDark"
      ? "text-white/90 underline-offset-2 transition-colors hover:text-accent-300"
      : "text-brand-700 transition-colors hover:text-brand-500";
  const currentClass =
    variant === "onDark"
      ? "font-semibold text-accent-300"
      : "font-semibold text-brand-900";
  const separatorClass = variant === "onDark" ? "text-white/50" : "text-neutral-400";
  const navClass =
    variant === "onDark" ? "mb-3 text-sm text-white/80" : "mb-3 text-sm text-neutral-500";

  return (
    <>
      <nav aria-label="breadcrumb" className={navClass}>
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.href}-${item.label}`} className="flex items-center gap-1">
                {index > 0 && (
                  <span className={separatorClass} aria-hidden="true">
                    ›
                  </span>
                )}
                {isLast || !item.href ? (
                  <span className={currentClass} aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(items) }}
      />
    </>
  );
}
