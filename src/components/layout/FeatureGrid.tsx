import Image from "next/image";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { wpUrlToLocal } from "@/lib/media";
import type { FeatureCard } from "@/lib/structured-pages/types";

export function FeatureGrid({
  cards,
  minCardHeight = false,
}: {
  cards: FeatureCard[];
  minCardHeight?: boolean;
}) {
  return (
    <ResponsiveGrid preset="feature">
      {cards.map((card) => {
        const imageSrc = card.image ? wpUrlToLocal(card.image) ?? card.image : null;
        return (
          <article
            key={card.title}
            className={`flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm ${minCardHeight ? "min-h-0 sm:min-h-[260px] lg:min-h-[280px]" : ""}`}
          >
            {imageSrc ? (
              <div className="relative aspect-[4/3] bg-neutral-100">
                <Image
                  src={imageSrc}
                  alt={card.imageAlt || card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="text-base font-bold text-brand-900 sm:text-lg">{card.title}</h3>
              <div
                className="rich-text mt-2 flex-1 text-sm leading-relaxed text-neutral-600 sm:mt-3 sm:text-base [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: card.descriptionHtml }}
              />
            </div>
          </article>
        );
      })}
    </ResponsiveGrid>
  );
}
