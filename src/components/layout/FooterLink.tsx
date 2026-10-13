import Link from "next/link";

const linkClass =
  "text-[14px] leading-snug text-white/75 transition-[color,transform,text-decoration-color] duration-200 motion-reduce:transition-none motion-reduce:hover:translate-x-0 hover:text-accent-300 hover:-translate-x-0.5 hover:underline underline-offset-2 focus-visible:text-accent-300 focus-visible:underline";

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  dir?: "ltr" | "rtl" | "auto";
  tabIndex?: number;
};

export function FooterLink({ href, children, external, className, dir, tabIndex }: FooterLinkProps) {
  const cls = className ? `${linkClass} ${className}` : linkClass;
  const isExternal = external ?? /^https?:\/\//.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className={cls}
        dir={dir}
        tabIndex={tabIndex}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} dir={dir} tabIndex={tabIndex}>
      {children}
    </Link>
  );
}
