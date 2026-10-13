import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/constants";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { motion, radius } from "@/lib/ui-tokens";

type Variant = "onDark" | "onLight" | "pill";

const variants: Record<Variant, string> = {
  pill: [
    "min-h-[42px] rounded-full border-2 border-white/75 bg-white/[0.08] px-3 min-[1440px]:px-4 text-white",
    motion.interactive,
    "hover:border-accent hover:bg-white/[0.16] hover:text-accent-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900",
    "[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-accent",
  ].join(" "),
  onDark: [
    "text-white",
    radius.button,
    motion.interactive,
    "hover:bg-accent hover:text-brand-900",
    "focus-visible:bg-accent focus-visible:text-brand-900",
    "active:bg-accent active:text-brand-900",
    "[&_svg]:text-current",
  ].join(" "),
  onLight: "font-semibold text-brand-700 hover:text-brand-900 [&_svg]:text-current",
};

type Props = {
  variant?: Variant;
  className?: string;
  showIcon?: boolean;
};

export function PhoneCta({ variant = "onLight", className = "", showIcon = true }: Props) {
  return (
    <a
      href={`tel:${PHONE_TEL}`}
      className={`inline-flex items-center gap-2 whitespace-nowrap px-2.5 py-2 text-sm font-semibold ${variants[variant]} ${className}`}
      aria-label={`התקשרו אלינו ${PHONE_DISPLAY}`}
    >
      {showIcon ? <PhoneHandsetIcon /> : null}
      <span dir="ltr">{PHONE_DISPLAY}</span>
    </a>
  );
}

/** Mobile header phone — gold pill, full number, centered in header grid */
export function MobileHeaderPhone() {
  return (
    <a
      href={`tel:${PHONE_TEL}`}
      className={[
        "inline-flex min-h-[42px] max-h-[44px] items-center justify-center gap-1.5",
        "whitespace-nowrap rounded-2xl bg-accent px-2.5 py-2",
        "text-[13px] font-bold leading-none text-brand-900 shadow-sm",
        "max-[360px]:px-2 max-[360px]:text-xs",
        radius.button,
        motion.interactive,
        "hover:bg-brand-800 hover:text-white",
        "focus-visible:bg-brand-800 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900",
        "active:bg-brand-800 active:text-white",
        "[&_svg]:text-current",
      ].join(" ")}
      aria-label={`התקשרו אלינו ${PHONE_DISPLAY}`}
    >
      <PhoneHandsetIcon className="h-4 w-4 shrink-0" />
      <span dir="ltr">{PHONE_DISPLAY}</span>
    </a>
  );
}
