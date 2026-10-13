import { SectionHeading } from "@/components/ui/SectionHeading";
import { layoutWidth } from "@/lib/layout";
import type { ProseContent } from "@/lib/structured-content/types";
import { ProseBody } from "@/components/structured-content/ProseBody";

export function SectionIntro({
  heading,
  intro,
  align = "start",
  dark = false,
}: {
  heading?: string | null;
  intro?: ProseContent | null;
  align?: "start" | "center";
  dark?: boolean;
}) {
  if (!heading && !intro?.paragraphs.length) return null;

  return (
    <div className={`mb-8 sm:mb-10 ${align === "center" ? "text-center" : "text-start"}`}>
      {heading ? (
        <SectionHeading
          title={heading}
          align={align}
          className={dark ? "!text-white mb-4" : "mb-4"}
        />
      ) : null}
      {intro?.paragraphs.length ? (
        <div
          className={`mx-auto w-full ${layoutWidth.prose} ${align === "center" ? "mx-auto" : ""} ${dark ? "text-white/90" : "text-neutral-600"}`}
        >
          <ProseBody content={intro} variant="intro" dark={dark} />
        </div>
      ) : null}
    </div>
  );
}
