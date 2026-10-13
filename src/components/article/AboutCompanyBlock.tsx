import Image from "next/image";
import { MEDIA } from "@/config/media-paths";

const APPROVED_COPY = {
  title: "אודות המחבר",
  company: "אקספרס הובלות",
  paragraphs: [
    "אקספרס הובלות מציבה סטנדרט מקצועי גבוה ובלתי מתפשר בכל שירותי ההובלה, האריזה והאחסנה. כל המידע והמדריכים בפורטל זה מבוססים על הניסיון המעשי של מעל 15 שנה שנצבר בצוותי החברה, ונועדו לסייע לכם להתכונן למעבר בצורה חלקה, בטוחה ומיטבית.",
    "אנו מתחייבים לאמינות ולדיוק המידע שאנו מפרסמים, בהתאם לערכי המקצועיות שמובילים את החברה.",
  ],
};

export function AboutCompanyBlock() {
  return (
    <section
      className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:p-8"
      aria-labelledby="about-company-heading"
    >
      <h2 id="about-company-heading" className="text-xl font-bold text-brand-900 sm:text-2xl">
        {APPROVED_COPY.title}
      </h2>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white p-2 shadow-sm ring-1 ring-brand-100">
          <Image src={MEDIA.logoDesktop} alt="" fill className="object-contain p-1" sizes="56px" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-brand-900">{APPROVED_COPY.company}</p>
          {APPROVED_COPY.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mt-3 text-base leading-[1.85] text-neutral-700">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
