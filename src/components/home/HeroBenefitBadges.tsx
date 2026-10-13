import Image from "next/image";
import Link from "next/link";

type Benefit = {
  label: string;
  href: string;
  image: string;
  alt: string;
};

export function HeroBenefitBadges({ benefits }: { benefits: Benefit[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2.5 px-0.5 sm:gap-4" aria-label="שירותי אקספרס הובלות">
      {benefits.map((benefit) => (
        <li key={benefit.href} className="min-w-0">
          <Link
            href={benefit.href}
            className="group flex flex-col items-center text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900 rounded-lg"
          >
            <div className="relative h-[5.75rem] w-[5.75rem] shrink-0 sm:h-[6.25rem] sm:w-[6.25rem] lg:h-[6.75rem] lg:w-[6.75rem]">
              <Image
                src={benefit.image}
                alt={benefit.alt}
                fill
                className="object-contain drop-shadow-md transition duration-200 group-hover:scale-105 motion-reduce:transition-none"
                sizes="(max-width: 640px) 92px, (max-width: 1024px) 100px, 108px"
              />
            </div>
            <span className="mt-3 text-[17px] font-bold leading-tight text-white sm:text-[18px] lg:text-[20px]">
              {benefit.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
