import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="bg-gradient-to-b from-brand-50/40 via-white to-white">
      <Container className="flex min-h-[62vh] flex-col items-center justify-center px-4 py-16 text-center sm:py-20">
        <Logo variant="desktop" className="mb-8" />
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-900 sm:text-4xl">העמוד לא נמצא</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-600">
          ייתכן שהקישור שגוי או שהעמוד הוסר.
          <br />
          ניתן לחזור לדף הבית או ליצור איתנו קשר לקבלת עזרה.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button href="/" variant="gold" className="min-h-[48px] min-w-[200px] px-8">
            חזרה לדף הבית
          </Button>
          <Button
            href={`tel:${PHONE_TEL}`}
            variant="outlineDark"
            className="min-h-[48px] min-w-[200px] px-6"
            aria-label={`התקשרו אלינו ${PHONE_DISPLAY}`}
          >
            <PhoneHandsetIcon className="h-4 w-4 shrink-0" />
            התקשרו אלינו
          </Button>
        </div>
      </Container>
    </div>
  );
}
