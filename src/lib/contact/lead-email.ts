import { resolveFormTypeLabel } from "@/lib/contact/form-labels";

export type LeadEmailInput = {
  formType: string;
  formId?: string;
  name: string;
  phone: string;
  email?: string;
  fromAddress?: string;
  toAddress?: string;
  moveDate?: string;
  message?: string;
  pageTitle?: string;
  pagePath?: string;
  pageUrl?: string;
  pageType?: string;
  serviceContext?: string;
  popupContext?: string;
  openMethod?: string;
  elementorFormId?: string;
  auditFormId?: string;
  submittedAt: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) return "";
  return `${label}: ${v}`;
}

function htmlRow(label: string, cellHtml: string): string {
  if (!cellHtml.trim()) return "";
  return `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;vertical-align:top">${cellHtml}</td></tr>`;
}

function htmlPlainRow(label: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) return "";
  return htmlRow(label, escapeHtml(v));
}

function pageLabel(input: LeadEmailInput): string {
  return input.pageTitle?.trim() || "עמוד באתר";
}

function pageHref(input: LeadEmailInput): string | undefined {
  const url = input.pageUrl?.trim();
  if (url) return url;
  const path = input.pagePath?.trim();
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `https://express-hovalot.co.il${path.startsWith("/") ? path : `/${path}`}`;
}

function pageTextLine(input: LeadEmailInput): string {
  const label = pageLabel(input);
  const href = pageHref(input);
  if (href) return `עמוד: ${label} — ${href}`;
  return `עמוד: ${label}`;
}

function pageHtmlRow(input: LeadEmailInput): string {
  const label = escapeHtml(pageLabel(input));
  const href = pageHref(input);
  if (href) {
    const safeHref = escapeHtml(href);
    return htmlRow("עמוד", `<a href="${safeHref}" style="color:#0d4a1a">${label}</a>`);
  }
  return htmlRow("עמוד", label);
}

export function buildLeadEmail(input: LeadEmailInput): { subject: string; text: string; html: string } {
  const formLabel = resolveFormTypeLabel(input.formType, input.formId);
  const subjectPage = input.pageTitle?.trim() || "אקספרס הובלות";
  const subject = `פנייה חדשה | ${formLabel} | ${subjectPage}`.slice(0, 180);

  const sentAt = input.submittedAt.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

  const metaLines = [
    row("סוג טופס", formLabel),
    pageTextLine(input),
    row("זמן שליחה", sentAt),
    row("הקשר פופאפ", input.popupContext),
    row("אופן פתיחה", input.openMethod),
  ].filter(Boolean);

  const fieldLines = [
    row("שם", input.name),
    row("טלפון", input.phone),
    row("אימייל", input.email),
    row("כתובת מוצא", input.fromAddress),
    row("כתובת יעד", input.toAddress),
    row("תאריך מעבר", input.moveDate),
    row("הודעה", input.message),
  ].filter(Boolean);

  const text = ["=== פרטי עמוד ===", ...metaLines, "", "=== פרטי הפנייה ===", ...fieldLines].join("\n");

  const metaHtmlRows = [
    htmlPlainRow("סוג טופס", formLabel),
    pageHtmlRow(input),
    htmlPlainRow("זמן שליחה", sentAt),
    htmlPlainRow("הקשר פופאפ", input.popupContext),
    htmlPlainRow("אופן פתיחה", input.openMethod),
  ].join("");

  const fieldHtmlRows = fieldLines
    .map((line) => {
      const idx = line.indexOf(": ");
      if (idx === -1) return "";
      return htmlPlainRow(line.slice(0, idx), line.slice(idx + 2));
    })
    .join("");

  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 12px;font-size:18px">${escapeHtml(formLabel)}</h2>
<p style="margin:0 0 16px;color:#444">פנייה חדשה מאתר אקספרס הובלות</p>
<h3 style="margin:20px 0 8px;font-size:15px">פרטי עמוד</h3>
<table style="border-collapse:collapse">${metaHtmlRows}</table>
<h3 style="margin:20px 0 8px;font-size:15px">פרטי הפנייה</h3>
<table style="border-collapse:collapse">${fieldHtmlRows}</table>
</div>`;

  return { subject, text, html };
}
