import Image from "next/image";
import Link from "next/link";
import { MEDIA } from "@/config/media-paths";

type LogoVariant = "desktop" | "mobile" | "footer";

const config: Record<
  LogoVariant,
  { src: string; width: number; height: number; className: string }
> = {
  desktop: {
    src: MEDIA.logoDesktop,
    width: 500,
    height: 154,
    className: "hidden h-12 w-auto max-h-[56px] object-contain sm:block lg:h-14 lg:max-h-[58px]",
  },
  mobile: {
    src: MEDIA.logoMobile,
    width: 400,
    height: 203,
    className: "h-12 max-h-[52px] w-auto min-w-[120px] object-contain sm:hidden",
  },
  footer: {
    src: MEDIA.logoFooter,
    width: 220,
    height: 58,
    className:
      "h-auto w-[180px] max-w-full brightness-[1.4] contrast-[1.08] sm:w-[195px] lg:w-[210px]",
  },
};

export function Logo({
  variant = "desktop",
  className = "",
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const { src, width, height, className: sizeClass } = config[variant];

  if (variant === "desktop") {
    return (
      <Link
        href="/"
        className={`inline-flex max-h-[56px] shrink-0 items-center overflow-hidden ${className}`}
        aria-label="אקספרס הובלות בירושלים - דף הבית"
      >
        <Image
          src={MEDIA.logoMobile}
          alt="לוגו אקספרס הובלות בירושלים"
          width={400}
          height={203}
          priority
          className={config.mobile.className}
        />
        <Image
          src={MEDIA.logoDesktop}
          alt="לוגו אקספרס הובלות בירושלים"
          width={500}
          height={154}
          priority
          className={sizeClass}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 shrink-0 items-center ${className}`}
      aria-label="אקספרס הובלות בירושלים - דף הבית"
    >
      <Image
        src={src}
        alt="לוגו אקספרס הובלות בירושלים"
        width={width}
        height={height}
        priority={variant !== "footer"}
        className={sizeClass}
      />
    </Link>
  );
}
