import { NextResponse } from "next/server";
import { sendLeadEmail } from "@/lib/contact/send-lead-email";
import { getContactRecipients, isContactEmailEnabled } from "@/lib/env";

type ContactPayload = {
  name?: string;
  phone?: string;
  email?: string;
  fromAddress?: string;
  toAddress?: string;
  moveDate?: string;
  message?: string;
  formType?: string;
  formId?: string;
  popupContext?: string;
  pageTitle?: string;
  pagePath?: string;
  pageUrl?: string;
  pageType?: string;
  serviceContext?: string;
  openMethod?: string;
  elementorFormId?: string;
  auditFormId?: string;
  website?: string;
  field_5ca8ec1?: string;
};

function sanitize(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function siteOriginFromRequest(request: Request): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://express-hovalot.co.il";
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (body.website || body.field_5ca8ec1) {
    return NextResponse.json({ ok: true, message: "received" });
  }

  const name = sanitize(body.name, 120);
  const phone = sanitize(body.phone, 40);
  const formType = sanitize(body.formType, 80) || "quote";

  if (formType === "footer-mini") {
    if (!phone) {
      return NextResponse.json(
        { ok: false, message: "טלפון הוא שדה חובה" },
        { status: 422 },
      );
    }
  } else if (!name || !phone) {
    return NextResponse.json(
      { ok: false, message: "שם וטלפון הם שדות חובה" },
      { status: 422 },
    );
  }

  const recipients = getContactRecipients();
  const emailEnabled = isContactEmailEnabled();

  const pagePath = sanitize(body.pagePath, 300);
  const origin = siteOriginFromRequest(request);
  const pageUrl =
    sanitize(body.pageUrl, 500) ||
    (pagePath ? `${origin}${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}` : origin);

  const leadInput = {
    formType,
    formId: sanitize(body.formId, 80) || undefined,
    name: name || "—",
    phone,
    email: sanitize(body.email, 200) || undefined,
    fromAddress: sanitize(body.fromAddress) || undefined,
    toAddress: sanitize(body.toAddress) || undefined,
    moveDate: sanitize(body.moveDate, 40) || undefined,
    message: sanitize(body.message, 2000) || undefined,
    pageTitle: sanitize(body.pageTitle, 200) || undefined,
    pagePath: pagePath || undefined,
    pageUrl: pageUrl || undefined,
    pageType: sanitize(body.pageType, 80) || undefined,
    serviceContext: sanitize(body.serviceContext, 300) || undefined,
    popupContext: sanitize(body.popupContext, 80) || undefined,
    openMethod: sanitize(body.openMethod, 40) || undefined,
    elementorFormId: sanitize(body.elementorFormId, 40) || undefined,
    auditFormId: sanitize(body.auditFormId, 40) || undefined,
    submittedAt: new Date(),
  };

  if (emailEnabled) {
    if (recipients.length === 0) {
      return NextResponse.json(
        { ok: false, message: "CONTACT_RECIPIENTS לא מוגדר" },
        { status: 500 },
      );
    }

    const sent = await sendLeadEmail(leadInput);
    if (!sent.ok) {
      if (sent.reason === "missing-config") {
        return NextResponse.json(
          { ok: false, message: "שליחת אימייל לא מוגדרת (RESEND)" },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { ok: false, message: "שגיאה בשליחת האימייל. נסו שוב או התקשרו אלינו." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "תודה! הפנייה התקבלה ונשלחה אלינו.",
      emailSent: true,
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[contact] email disabled — lead captured only", leadInput);
  }

  return NextResponse.json({
    ok: true,
    message: "הפנייה התקבלה (שליחת אימייל מושבתת)",
    emailSent: false,
  });
}
