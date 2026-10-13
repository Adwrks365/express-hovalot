import { homepageContact } from "@/content/homepage-content";
import { PhoneHandsetIcon } from "@/components/ui/PhoneHandsetIcon";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/constants";

function LocationIcon() {
  return (
    <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

/** Compact office/contact facts — information only, not a conversion block */
export function BusinessDetails() {
  return (
    <section className="mt-10 border-t border-neutral-200 pt-8" aria-labelledby="business-details-heading">
      <h2 id="business-details-heading" className="sr-only">
        פרטי התקשרות
      </h2>
      <ul className="space-y-3.5 text-base text-neutral-700">
        <li className="flex items-start gap-3">
          <LocationIcon />
          <div>
            <p className="font-semibold text-brand-800">{homepageContact.officeTitle}</p>
            <p className="mt-0.5 leading-relaxed">{homepageContact.address}</p>
          </div>
        </li>
        <li className="flex items-center gap-3">
          <PhoneHandsetIcon className="h-5 w-5 text-brand-600" />
          <a
            href={`tel:${PHONE_TEL}`}
            className="font-semibold text-brand-700 transition-colors hover:text-brand-900 hover:underline underline-offset-2"
            dir="ltr"
          >
            {PHONE_DISPLAY}
          </a>
        </li>
        <li className="flex items-center gap-3">
          <EmailIcon />
          <a
            href={`mailto:${homepageContact.email}`}
            className="text-brand-700 transition-colors hover:text-brand-900 hover:underline underline-offset-2"
            dir="ltr"
          >
            {homepageContact.email}
          </a>
        </li>
      </ul>
    </section>
  );
}
