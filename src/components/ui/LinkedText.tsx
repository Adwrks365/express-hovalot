import Link from "next/link";
import type { ReactNode } from "react";

export type TextLink = { anchor: string; href: string };

const defaultLinkClass =
  "font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-800";

/** Renders copy verbatim, turning the first occurrence of each anchor phrase into an internal link. */
export function LinkedText({ text, links = [], linkClassName = defaultLinkClass }: { text: string; links?: TextLink[]; linkClassName?: string }) {
  if (!links.length) return <>{text}</>;
  const out: ReactNode[] = [];
  let rest = text;
  const pending = [...links];
  let key = 0;
  while (pending.length) {
    let best = -1;
    let bestAt = Infinity;
    pending.forEach((l, i) => {
      const at = rest.indexOf(l.anchor);
      if (at >= 0 && at < bestAt) {
        bestAt = at;
        best = i;
      }
    });
    if (best < 0) break;
    const link = pending.splice(best, 1)[0]!;
    if (bestAt > 0) out.push(rest.slice(0, bestAt));
    out.push(
      <Link key={key++} href={link.href} className={linkClassName}>
        {link.anchor}
      </Link>,
    );
    rest = rest.slice(bestAt + link.anchor.length);
  }
  if (rest) out.push(rest);
  return <>{out}</>;
}
