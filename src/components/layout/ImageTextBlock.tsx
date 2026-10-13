import Image from "next/image";
import { RichText } from "@/components/internal/RichText";
import { gridClass } from "@/lib/layout";

export function ImageTextBlock({
  image,
  imageAlt,
  html,
  imagePosition = "start",
  animate = false,
}: {
  image?: string | null;
  imageAlt?: string;
  html: string;
  imagePosition?: "start" | "end";
  animate?: boolean;
}) {
  const imageBlock = image ? (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-soft lg:max-w-none">
      <Image
        src={image}
        alt={imageAlt || ""}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 480px"
      />
    </div>
  ) : null;

  const textBlock = (
    <div className="min-w-0 w-full">
      <RichText html={html} variant="wide" animate={animate} />
    </div>
  );

  return (
    <div
      className={`${gridClass.split} ${imagePosition === "end" ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      {/* Mobile: image first for visual anchor; desktop respects imagePosition */}
      {imageBlock}
      {textBlock}
    </div>
  );
}
