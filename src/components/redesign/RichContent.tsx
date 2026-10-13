import Image from "next/image";
import type { RichBlock } from "@/lib/redesign/types";

type Tone = "light" | "dark";

const linkClass = {
  light: "[&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_a]:decoration-brand-300 [&_a]:underline-offset-4 hover:[&_a]:text-brand-800",
  dark: "[&_a]:font-medium [&_a]:text-accent-300 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white",
};

const textClass = {
  light: "text-neutral-700 [&_strong]:font-semibold [&_strong]:text-brand-900",
  dark: "text-white/85 [&_strong]:font-semibold [&_strong]:text-white",
};

const headingClass = {
  light: "font-bold text-brand-800",
  dark: "font-bold text-white",
};

function html(value: string) {
  return { __html: value };
}

/** Renders parsed source rich blocks (paragraphs, sub-headings, lists, tables, inline images). */
export function RichContent({
  blocks,
  tone = "light",
  size = "base",
  className = "",
}: {
  blocks: RichBlock[];
  tone?: Tone;
  size?: "base" | "sm";
  className?: string;
}) {
  if (!blocks.length) return null;
  const pSize = size === "sm" ? "text-[0.97rem] leading-[1.75]" : "text-base leading-[1.85] sm:text-[1.0625rem]";
  return (
    <div className={`space-y-4 ${textClass[tone]} ${linkClass[tone]} ${className}`.trim()}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "p":
            return <p key={i} className={pSize} dangerouslySetInnerHTML={html(b.html)} />;
          case "quote":
            return (
              <blockquote
                key={i}
                className={`border-s-4 border-accent ps-4 italic ${pSize}`}
                dangerouslySetInnerHTML={html(b.html)}
              />
            );
          case "h": {
            const Tag = (b.as ? `h${b.as}` : b.level <= 3 ? "h3" : "h4") as "h2" | "h3" | "h4";
            return (
              <Tag
                key={i}
                className={`${headingClass[tone]} ${b.level <= 3 ? "pt-2 text-lg sm:text-xl" : "pt-1 text-base sm:text-lg"}`}
                dangerouslySetInnerHTML={html(b.html)}
              />
            );
          }
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className={`space-y-2 ${pSize}`}>
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    {b.ordered ? (
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tone === "dark" ? "bg-white/15 text-accent-300" : "bg-brand-100 text-brand-700"}`}
                        aria-hidden="true"
                      >
                        {j + 1}
                      </span>
                    ) : (
                      <span
                        className={`mt-[0.7em] h-2 w-2 shrink-0 rounded-full ${tone === "dark" ? "bg-accent-300" : "bg-brand-500"}`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0" dangerouslySetInnerHTML={html(item)} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
                <table className="w-full min-w-[480px] border-collapse text-start text-[0.95rem]">
                  {b.head.length ? (
                    <thead className="bg-brand-800 text-white">
                      {b.head.map((row, r) => (
                        <tr key={r}>
                          {row.map((cell, c) => (
                            <th key={c} className="px-4 py-3 text-start font-semibold" dangerouslySetInnerHTML={html(cell)} />
                          ))}
                        </tr>
                      ))}
                    </thead>
                  ) : null}
                  <tbody>
                    {b.body.map((row, r) => (
                      <tr key={r} className="border-t border-brand-50 even:bg-brand-50/50">
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-3 align-top text-neutral-800" dangerouslySetInnerHTML={html(cell)} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "img":
            return (
              <div key={i} className="overflow-hidden rounded-2xl bg-neutral-100 shadow-card">
                <Image src={b.src} alt={b.alt} width={1200} height={800} className="h-auto w-full" sizes="(max-width: 1024px) 92vw, 760px" />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Single inline HTML fragment (already sanitized to a/strong/em/br by the parser). */
export function InlineHtml({ value, className = "", as: Tag = "span" }: { value: string; className?: string; as?: "span" | "p" }) {
  return <Tag className={className} dangerouslySetInnerHTML={html(value)} />;
}
