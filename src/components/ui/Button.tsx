import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, radius } from "@/lib/ui-tokens";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "heroOutline"
  | "outlineDark"
  | "whatsapp"
  | "phone"
  | "gold";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-sm hover:bg-brand-400 hover:-translate-y-px hover:shadow-md focus-visible:ring-brand-400",
  secondary:
    "bg-brand-800 text-white hover:bg-brand-700 hover:-translate-y-px hover:shadow-md focus-visible:ring-brand-600",
  gold:
    "bg-accent text-brand-900 font-bold shadow-sm hover:bg-accent-dark hover:-translate-y-px hover:shadow-md focus-visible:ring-accent",
  outline:
    "border-2 border-white/90 bg-transparent text-white hover:border-white hover:bg-white/10 hover:shadow-sm focus-visible:ring-white",
  heroOutline:
    "border border-white/50 bg-black/25 text-white shadow-sm hover:!border-white hover:!bg-white hover:!text-brand-900 hover:shadow-md focus-visible:!border-white focus-visible:!bg-white focus-visible:!text-brand-900 focus-visible:ring-accent active:!bg-white active:!text-brand-900 [&_svg]:text-current hover:[&_svg]:!text-brand-900 focus-visible:[&_svg]:!text-brand-900 [&_span]:text-current hover:[&_span]:!text-brand-900 focus-visible:[&_span]:!text-brand-900",
  outlineDark:
    "border-2 border-brand-600 bg-transparent text-brand-800 hover:!border-brand-600 hover:!bg-brand-600 hover:!text-white hover:shadow-sm focus-visible:!border-brand-600 focus-visible:!bg-brand-600 focus-visible:!text-white focus-visible:ring-brand-500 active:!bg-brand-600 active:!text-white [&_svg]:text-current hover:[&_svg]:!text-white focus-visible:[&_svg]:!text-white [&_span]:text-current hover:[&_span]:!text-white focus-visible:[&_span]:!text-white",
  whatsapp:
    "bg-[#25D366] text-white shadow-sm hover:bg-[#1da851] hover:-translate-y-px hover:shadow-md focus-visible:ring-[#25D366]",
  phone:
    "bg-brand-800 text-white hover:bg-brand-700 hover:-translate-y-px hover:shadow-md focus-visible:ring-brand-600",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: Props) {
  const base = [
    "inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold",
    radius.button,
    motion.interactive,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "min-h-[46px]",
  ].join(" ");

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    const external =
      href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
