import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/content/Breadcrumbs";
import { Container } from "@/components/ui/Container";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" });
}

export function ArticleHero({
  title,
  breadcrumbs,
  category,
  authorName,
  authorPath,
  published,
  modified,
  featuredImage,
}: {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  category?: { name: string; href: string } | null;
  authorName: string;
  authorPath: string;
  published?: string;
  modified?: string;
  featuredImage?: string | null;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white" data-redesign-hero>
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a2a0d_0%,#003405_45%,#13330E_100%)]" />
        <div className="absolute -top-32 start-[-8rem] h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 end-[-6rem] h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-3xl" />
      </div>
      <Container width="standard" className="relative py-10 sm:py-12 lg:py-14">
        <div className={`grid items-center gap-8 lg:gap-12 ${featuredImage ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)]" : ""}`}>
          <div className="min-w-0">
            <Breadcrumbs items={breadcrumbs} variant="onDark" />
            {category ? (
              <Link
                href={category.href}
                className="mb-4 inline-flex rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-sm font-semibold text-accent-300 transition-colors hover:bg-accent/20"
              >
                {category.name}
              </Link>
            ) : null}
            <h1 className="max-w-[46rem] text-balance text-[1.85rem] font-bold leading-[1.2] sm:text-[2.25rem] lg:text-[2.6rem]">{title}</h1>
            <span className="mt-5 block h-1 w-16 rounded-full bg-accent" aria-hidden="true" />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
              {published ? (
                <time dateTime={published}>
                  פורסם: <span className="font-semibold text-white">{formatDate(published)}</span>
                </time>
              ) : null}
              {modified && modified !== published ? (
                <time dateTime={modified}>
                  עודכן: <span className="font-semibold text-white">{formatDate(modified)}</span>
                </time>
              ) : null}
              <span>
                מאת:{" "}
                <Link href={authorPath} className="font-semibold text-accent-300 hover:text-white">
                  {authorName}
                </Link>
              </span>
            </div>
          </div>
          {featuredImage ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-brand-800 shadow-elevated ring-1 ring-white/15">
              <Image src={featuredImage} alt="" fill preload className="object-cover" sizes="(max-width: 1024px) 92vw, 460px" />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
