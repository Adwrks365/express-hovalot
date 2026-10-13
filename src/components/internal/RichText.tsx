import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { layoutWidth } from "@/lib/layout";
import { enrichRichTextHtml } from "@/lib/rich-text-layout";

const variantClass = {
  standard: `${layoutWidth.prose} rich-text-standard`,
  wide: `${layoutWidth.content} rich-text-wide`,
  article: `${layoutWidth.prose} rich-text-article`,
} as const;

export function RichText({
  html,
  variant = "standard",
  animate = true,
}: {
  html: string;
  variant?: "standard" | "article" | "wide";
  /** Articles and long-form content must never depend on scroll-reveal for visibility */
  animate?: boolean;
}) {
  const enriched = enrichRichTextHtml(html);
  const columnClass = `rich-text mx-auto w-full min-w-0 ${variantClass[variant]}`;

  const body = <div className={columnClass} dangerouslySetInnerHTML={{ __html: enriched }} />;

  if (!animate || variant === "article") {
    return body;
  }

  return <ScrollReveal variant="subtle">{body}</ScrollReveal>;
}
