import { ProseWidth } from "@/components/ui/ProseWidth";

export function WordPressContent({
  html,
  variant = "normal",
}: {
  html: string;
  variant?: "normal" | "wide" | "article";
}) {
  const proseVariant = variant === "wide" ? "wide" : variant === "article" ? "normal" : "content";

  return (
    <ProseWidth variant={proseVariant} className="wp-content px-4 sm:px-0">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </ProseWidth>
  );
}
