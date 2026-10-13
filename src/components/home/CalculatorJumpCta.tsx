import Link from "next/link";
import { radius, motion } from "@/lib/ui-tokens";

/** Production post-2701 — jump link immediately below Hero */
export function CalculatorJumpCta() {
  return (
    <div className="bg-white py-7 sm:py-8">
      <div className="mx-auto flex justify-center px-4 sm:px-6">
        <Link
          href="#calculator"
          className={[
            "inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5",
            "bg-brand-800 text-sm font-bold text-white shadow-sm",
            radius.button,
            motion.interactive,
            "hover:bg-brand-700 hover:text-white",
            "focus-visible:bg-brand-700 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            "sm:min-h-[46px] sm:px-6 sm:text-[15px]",
            "[&_svg]:text-current",
          ].join(" ")}
        >
          <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>לחצו כאן למחשבון הובלה</span>
        </Link>
      </div>
    </div>
  );
}
