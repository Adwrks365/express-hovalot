import Image from "next/image";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { mediaRoleClass } from "@/lib/layout";

export type ProfileItem = {
  image: string;
  name?: string;
  role?: string;
  caption?: string;
};

/** Team / testimonial portrait grid — not raw vertical image stacks */
export function ProfileGrid({ items }: { items: ProfileItem[] }) {
  return (
    <ResponsiveGrid preset="profile">
      {items.map((item) => (
        <article
          key={item.image + (item.name || "")}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[9.5rem] overflow-hidden sm:max-w-[10rem]">
            <Image src={item.image} alt={item.name || ""} fill className={`object-cover ${mediaRoleClass.avatar}`} sizes="160px" />
          </div>
          {(item.name || item.role || item.caption) && (
            <div className="p-4 text-center sm:text-start">
              {item.name ? <h3 className="text-base font-bold text-brand-900">{item.name}</h3> : null}
              {item.role ? <p className="mt-1 text-sm text-neutral-500">{item.role}</p> : null}
              {item.caption ? (
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.caption}</p>
              ) : null}
            </div>
          )}
        </article>
      ))}
    </ResponsiveGrid>
  );
}
