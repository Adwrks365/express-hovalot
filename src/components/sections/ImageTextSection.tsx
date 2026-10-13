import { ImageTextBlock } from "@/components/layout/ImageTextBlock";
import type { SectionTone } from "@/components/layout/ResponsiveSection";
import { SectionShell } from "@/components/sections/SectionShell";
import { wpUrlToLocal } from "@/lib/media";

export function ImageTextSection({
  image,
  imageAlt,
  html,
  imagePosition = "start",
  tone = "white",
  animate = false,
}: {
  image?: string | null;
  imageAlt?: string;
  html: string;
  imagePosition?: "start" | "end";
  tone?: SectionTone;
  animate?: boolean;
}) {
  const resolved = image ? wpUrlToLocal(image) : null;

  return (
    <SectionShell tone={tone}>
      <ImageTextBlock
        image={resolved}
        imageAlt={imageAlt}
        html={html}
        imagePosition={imagePosition}
        animate={animate}
      />
    </SectionShell>
  );
}
