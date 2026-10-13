import { layoutWidth } from "@/lib/layout";
import { sectionTitleClass } from "@/lib/ui-tokens";

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  light = false,
  className = "",
  subtitleClassName = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "start" | "center";
  light?: boolean;
  className?: string;
  subtitleClassName?: string;
}) {
  const alignClass =
    align === "center" ? `text-center mx-auto ${layoutWidth.content}` : `text-start ${layoutWidth.content}`;
  const titleClass = light ? "text-white" : sectionTitleClass;
  const subtitleClass = light ? "text-white/85" : "text-neutral-600";

  return (
    <div className={`mb-6 w-full min-w-0 sm:mb-8 ${alignClass} ${className}`.trim()}>
      <h2 className={titleClass}>{title}</h2>
      {subtitle ? (
        <p className={`mt-3 text-base leading-relaxed sm:text-lg ${subtitleClass} ${subtitleClassName}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}
