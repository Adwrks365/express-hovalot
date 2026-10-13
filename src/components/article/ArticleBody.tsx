import { CtaButtonRow } from "@/components/redesign/CtaButtons";
import { RichContent } from "@/components/redesign/RichContent";
import { RichFaq } from "@/components/redesign/RichFaq";
import type { ArticlePart } from "@/lib/redesign/article";

const headingClass: Record<2 | 3 | 4, string> = {
  2: "pt-4 text-[1.55rem] font-bold leading-snug text-brand-900 sm:text-[1.8rem]",
  3: "pt-2 text-xl font-bold leading-snug text-brand-800 sm:text-[1.35rem]",
  4: "pt-1 text-lg font-bold text-brand-800",
};

export function ArticleBody({ parts }: { parts: ArticlePart[] }) {
  return (
    <div className="space-y-5 sm:space-y-6" data-article-body>
      {parts.map((part, i) => {
        switch (part.kind) {
          case "heading": {
            const Tag = `h${part.level}` as "h2" | "h3" | "h4";
            return (
              <Tag key={i} id={part.id ?? undefined} className={headingClass[part.level]}>
                {part.level === 2 ? <span className="mb-3 block h-1 w-10 rounded-full bg-accent" aria-hidden="true" /> : null}
                <span dangerouslySetInnerHTML={{ __html: part.html }} />
              </Tag>
            );
          }
          case "buttons":
            return (
              <div key={i} className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 sm:p-5">
                <CtaButtonRow buttons={part.buttons} surface="light" />
              </div>
            );
          case "faq":
            return (
              <div key={i} data-section-type="faq">
                <RichFaq
                  items={part.items.map((item) => ({ question: item.question, answer: <RichContent blocks={item.answer} size="sm" /> }))}
                />
              </div>
            );
          default:
            return <RichContent key={i} blocks={part.blocks} />;
        }
      })}
    </div>
  );
}
