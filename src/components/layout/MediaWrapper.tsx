import Image from "next/image";
import { iconCellClass, logoCellClass, logoImageClass, mediaRoleClass } from "@/lib/layout";

export type MediaRole = "icon" | "logo" | "avatar" | "card" | "content-medium" | "content-wide" | "hero";

const roleToClass: Record<MediaRole, string> = {
  icon: mediaRoleClass.icon,
  logo: mediaRoleClass.logo,
  avatar: mediaRoleClass.avatar,
  card: mediaRoleClass.card,
  "content-medium": mediaRoleClass.contentMedium,
  "content-wide": mediaRoleClass.contentWide,
  hero: mediaRoleClass.hero,
};

/** Fixed responsive wrapper — source dimensions never control display size */
export function MediaWrapper({
  src,
  alt = "",
  role,
  className = "",
  priority = false,
  sizes,
}: {
  src: string;
  alt?: string;
  role: MediaRole;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (role === "icon") {
    return (
      <div className={`${iconCellClass} ${className}`.trim()}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes={sizes || "64px"}
          priority={priority}
          aria-hidden={!alt}
        />
      </div>
    );
  }

  if (role === "logo") {
    return (
      <div className={`${logoCellClass} ${className}`.trim()}>
        <Image
          src={src}
          alt={alt || "לוגו"}
          width={120}
          height={60}
          className={logoImageClass}
          priority={priority}
        />
      </div>
    );
  }

  const roleClass = roleToClass[role];
  return (
    <div className={`${roleClass} ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="h-full w-full object-contain"
        sizes={sizes || "100vw"}
        priority={priority}
      />
    </div>
  );
}
