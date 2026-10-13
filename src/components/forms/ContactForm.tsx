"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useLeadPageContext } from "@/hooks/useLeadPageContext";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const id = useId();
  const pageContext = useLeadPageContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-neutral-200 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (website) return;
    setState("submitting");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          website,
          formType: "contact",
          formId: "contact-section",
          pagePath: pageContext.pagePath,
          pageTitle: pageContext.pageTitle,
          pageUrl: pageContext.pageUrl,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "שגיאה בשליחת הטופס");
      }
      setState("success");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "שגיאה בשליחת הטופס");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-900" role="status">
        <p className="text-lg font-semibold">תודה! הפנייה התקבלה.</p>
        <p className="mt-2 text-base">נחזור אליכם בהקדם.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-label="טופס יצירת קשר" data-lead-form>
      <input id={`${id}-name`} name="name" type="text" required placeholder="שם" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      <input id={`${id}-phone`} name="phone" type="tel" required placeholder="טלפון" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
      <input id={`${id}-email`} name="email" type="email" placeholder="אימייל" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
      <textarea id={`${id}-message`} name="message" rows={4} placeholder="הודעה" className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} />
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {state === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="gold" className="w-full min-h-[48px]" disabled={state === "submitting"}>
        {state === "submitting" ? "שולח..." : "שליחה"}
      </Button>
    </form>
  );
}
