"use client";

import Image from "next/image";
import { useState } from "react";
import type { SourceImage } from "@/lib/redesign/types";

export function VideoFacade({ embed, title, poster }: { embed: string; title: string; poster: SourceImage }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <iframe
        src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`הפעלת וידאו: ${title}`} className="group absolute inset-0 cursor-pointer">
      <Image src={poster.src} alt={poster.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 92vw, 700px" />
      <span className="absolute inset-0 bg-brand-950/30 transition-colors group-hover:bg-brand-950/20" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-brand-950 shadow-elevated transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
        <svg viewBox="0 0 24 24" className="ms-1 h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" aria-hidden="true">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
        </svg>
      </span>
    </button>
  );
}
