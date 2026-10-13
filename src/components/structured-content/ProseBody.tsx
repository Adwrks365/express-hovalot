import Link from "next/link";
import type { ContentLink, ProseContent } from "@/lib/structured-content/types";

export function ProseBody({
  content,
  variant = "body",
  dark = false,
  links,
}: {
  content: ProseContent;
  variant?: "body" | "intro";
  dark?: boolean;
  links?: ContentLink[];
}) {
  const textClass =
    variant === "intro"
      ? "text-base leading-[1.78] sm:text-lg"
      : "text-[1.0625rem] leading-[1.85] lg:text-[1.125rem]";

  const color = dark ? "text-white/92" : "text-neutral-800";

  return (
    <div className={`space-y-5 ${textClass} ${color}`}>
      {content.paragraphs.map((p) => (
        <p key={p.slice(0, 48)}>{p}</p>
      ))}

      {content.lists?.map((list) => {
        const Tag = list.type === "ol" ? "ol" : "ul";
        return (
          <Tag
            key={`${list.type}-${list.items[0]?.slice(0, 20)}`}
            className={`ms-6 space-y-2 ${list.type === "ol" ? "list-decimal" : "list-disc"}`}
          >
            {list.items.map((item) => (
              <li key={item.slice(0, 40)} className="leading-[1.8]">
                {item}
              </li>
            ))}
          </Tag>
        );
      })}

      {content.tableHtml ? (
        <div
          className="rich-text-table-wrap rich-text"
          dangerouslySetInnerHTML={{ __html: content.tableHtml }}
        />
      ) : null}

      {links?.length ? (
        <ul className="flex flex-wrap gap-2 pt-2">
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                className="inline-flex min-h-[44px] items-center rounded-[14px] border border-brand-200 bg-brand-50/80 px-4 text-sm font-semibold text-brand-800 hover:bg-brand-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
