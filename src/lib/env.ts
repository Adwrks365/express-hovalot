const DEFAULT_CONTACT_RECIPIENTS = ["shinua30@gmail.com", "info@adwrks.co.il"];

export function getContactRecipients(): string[] {
  const raw = process.env.CONTACT_RECIPIENTS || "";
  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_CONTACT_RECIPIENTS;
}

export function getResendFrom(): string {
  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.CONTACT_FORM_FROM?.trim() ||
    process.env.CONTACT_FROM?.trim();
  return from || "";
}

export function isContactEmailEnabled(): boolean {
  return process.env.CONTACT_EMAIL_ENABLED === "true";
}

/** True on *.vercel.app (or explicit preview flag). Never true on express-hovalot.co.il. */
export function isVercelPreviewHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0] ?? "";
  if (h === "express-hovalot.co.il" || h === "www.express-hovalot.co.il") return false;
  if (h.endsWith(".vercel.app")) return true;
  return false;
}

export function isPreviewNoIndex(host?: string | null): boolean {
  if (host && isVercelPreviewHost(host)) return true;
  return process.env.NEXT_PUBLIC_PREVIEW_NOINDEX === "true";
}

export function getInsytixSiteId(): string | undefined {
  return process.env.NEXT_PUBLIC_INSYTIX_SITE_ID;
}
