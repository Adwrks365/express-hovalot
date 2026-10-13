"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Review = { name: string; text: string };

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm leading-none">
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full min-h-[160px] flex-col rounded-xl border border-white/15 bg-white/[0.12] p-4 backdrop-blur-sm sm:min-h-[170px] sm:p-5">
      <Stars />
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/95 whitespace-pre-line sm:text-base">
        {review.text}
      </p>
      <footer className="mt-3 border-t border-white/10 pt-2.5">
        <p className="text-sm font-semibold text-accent-300 sm:text-base">{review.name}</p>
        <p className="text-xs text-white/60">פורסם ב-Google</p>
      </footer>
    </article>
  );
}

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(1);

  const updatePerView = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1024) setPerView(3);
    else setPerView(1);
  }, []);

  useEffect(() => {
    function onResize() {
      updatePerView();
    }
    requestAnimationFrame(onResize);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updatePerView]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / perView));
  const currentPage = Math.min(page, totalPages - 1);

  function scrollToPage(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, totalPages - 1));
    const cards = track.querySelectorAll<HTMLElement>("[data-review-card]");
    const target = cards[clamped * perView];
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "start", block: "nearest" });
    setPage(clamped);
  }

  return (
    <div className="overflow-x-hidden">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
        dir="rtl"
        aria-live="polite"
      >
        {reviews.map((review) => (
          <div
            key={review.name + review.text.slice(0, 20)}
            data-review-card
            className="w-full shrink-0 snap-start lg:w-[calc(33.333%-0.67rem)]"
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="ביקורות הבאות"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex gap-2" role="tablist" aria-label="עמודי ביקורות">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={currentPage === i}
                aria-label={`עמוד ביקורות ${i + 1} מתוך ${totalPages}`}
                onClick={() => scrollToPage(i)}
                className="inline-flex h-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full p-3 transition-all"
              >
                <span
                  className={`block rounded-full transition-all ${currentPage === i ? "h-2.5 w-5 bg-accent" : "h-2.5 w-2.5 bg-white/35 hover:bg-white/50"}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 0}
            className="inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="ביקורות קודמות"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
