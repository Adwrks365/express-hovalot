import Image from "next/image";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { logoCellClass, logoImageClass } from "@/lib/layout";
import { MEDIA } from "@/config/media-paths";

const CLIENT_LOGO_BASENAMES = new Set(
  MEDIA.clientLogos.map((l) => l.path.split("/").pop()!).filter(Boolean),
);

function isClientLogo(src: string): boolean {
  const base = src.split("/").pop() || "";
  return CLIENT_LOGO_BASENAMES.has(base) || MEDIA.clientLogos.some((l) => src.includes(l.path));
}

export function LogoCollection({
  logos,
  useMarquee = false,
}: {
  logos?: { src: string; alt: string }[];
  useMarquee?: boolean;
}) {
  if (useMarquee || !logos?.length) {
    return <ClientLogoMarquee />;
  }

  const clientLogos = logos.filter((l) => isClientLogo(l.src));
  const display = clientLogos.length >= 3 ? clientLogos : logos;

  return (
    <ResponsiveGrid preset="logo">
      {display.map((logo) => (
        <div key={logo.src + logo.alt} className={logoCellClass}>
          <Image
            src={logo.src}
            alt={logo.alt || "לוגו לקוח"}
            width={120}
            height={60}
            className={logoImageClass}
          />
        </div>
      ))}
    </ResponsiveGrid>
  );
}
