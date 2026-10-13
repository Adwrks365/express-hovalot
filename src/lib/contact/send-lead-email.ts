import { Resend } from "resend";
import { buildLeadEmail, type LeadEmailInput } from "@/lib/contact/lead-email";
import { getContactRecipients, getResendFrom } from "@/lib/env";

export function isLeadEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && getResendFrom());
}

export async function sendLeadEmail(
  input: LeadEmailInput,
): Promise<{ ok: true } | { ok: false; reason: "missing-config" | "provider-error" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getResendFrom();
  const to = getContactRecipients();

  if (!apiKey || !from || to.length === 0) {
    return { ok: false, reason: "missing-config" };
  }

  const { subject, text, html } = buildLeadEmail(input);
  const resend = new Resend(apiKey);

  const replyTo =
    input.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
      ? input.email.trim()
      : undefined;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  if (error) {
    console.error("[contact] Resend rejected submission", {
      formType: input.formType,
      message: error.message,
    });
    return { ok: false, reason: "provider-error" };
  }

  return { ok: true };
}
