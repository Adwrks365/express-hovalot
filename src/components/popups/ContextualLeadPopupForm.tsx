"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { PopupContextType, PopupOpenMethod } from "@/lib/popups/types";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContextualLeadPopupForm({
  context,
  pageTitle,
  pagePath,
  openMethod,
  ctaLabel,
  onSuccess,
}: {
  context: PopupContextType;
  pageTitle: string;
  pagePath: string;
  openMethod: PopupOpenMethod;
  ctaLabel: string;
  onSuccess: () => void;
}) {
  const formId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

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
          fromAddress,
          toAddress,
          moveDate,
          message,
          website,
          formType: "contextual-popup",
          formId: "contextual-popup",
          popupContext: context,
          pageTitle,
          pagePath,
          pageUrl: typeof window !== "undefined" ? `${window.location.origin}${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}` : pagePath,
          openMethod,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message || "שגיאה בשליחה");
      setState("success");
      onSuccess();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "שגיאה בשליחה");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-green-900" role="status">
        <p className="font-semibold">תודה! הפנייה התקבלה.</p>
        <p className="mt-1 text-sm">נחזור אליכם בהקדם.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
      data-popup-lead-form
      aria-label="טופס הצעת מחיר מהירה"
      noValidate
    >
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div>
        <label htmlFor={`${formId}-name`} className="sr-only">
          שם
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="שם *"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${formId}-phone`} className="sr-only">
          טלפון
        </label>
        <input
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="טלפון *"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
        />
      </div>
      <div className="hidden gap-3 sm:grid sm:grid-cols-2">
        <input name="fromAddress" type="text" placeholder="מאיפה" className={inputClass} value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
        <input name="toAddress" type="text" placeholder="לאן" className={inputClass} value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
      </div>
      <input name="moveDate" type="text" placeholder="תאריך מעבר (אופציונלי)" className={`${inputClass} hidden sm:block`} value={moveDate} onChange={(e) => setMoveDate(e.target.value)} />
      <textarea
        name="message"
        rows={2}
        placeholder="פרטים נוספים (אופציונלי)"
        className={`${inputClass} min-h-[72px] resize-y`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {state === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="gold" className="w-full min-h-[48px]" disabled={state === "submitting"}>
        {state === "submitting" ? "שולחים…" : ctaLabel}
      </Button>
    </form>
  );
}
