/** RTL-oriented handset — mirrored once centrally for all phone CTAs */
export function PhoneHandsetIcon({ className = "h-5 w-5 shrink-0" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`${className} -scale-x-100`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.01l-2.2 2.22z" />
    </svg>
  );
}
