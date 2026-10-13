"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useLeadPageContext } from "@/hooks/useLeadPageContext";
import { radius } from "@/lib/ui-tokens";

type FormState = "idle" | "submitting" | "success" | "error";

const fieldClass = `w-full ${radius.input} border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-neutral-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[42px]`;

/** Production footer lead form — FORM-02 / Elementor e6d5b71. */
export function FooterMiniForm() {
  const formId = useId();
  const pageContext = useLeadPageContext();
  const errorId = `${formId}-error`;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    setState("submitting");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          formType: "footer-mini",
          formId: "footer-mini",
          elementorFormId: "e6d5b71",
          auditFormId: "FORM-02",
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
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "שגיאה בשליחת הטופס");
    }
  }

  if (state === "success") {
    return (
      <div
        className="rounded-lg border border-green-400/30 bg-green-900/20 p-3 text-center text-sm text-green-100"
        role="status"
      >
        תודה! הפנייה התקבלה.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate aria-label="טופס יצירת קשר בפוטר" data-lead-form>
      <div className="grid grid-cols-1 gap-2 lg:@[300px]/footercol:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_92px] lg:@[300px]/footercol:items-stretch">
        <div className="min-w-0">
          <label htmlFor={`${formId}-name`} className="sr-only">
            שם
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            name="name"
            autoComplete="name"
            placeholder="שם"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${formId}-phone`} className="sr-only">
            טלפון (שדה חובה)
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            dir="ltr"
            inputMode="tel"
            placeholder="טלפון *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            aria-required="true"
          />
        </div>
        <Button
          type="submit"
          variant="heroOutline"
          className="min-h-[42px] w-full px-2 py-1.5 text-sm font-semibold lg:@[300px]/footercol:h-[42px] lg:@[300px]/footercol:min-h-[42px] lg:@[300px]/footercol:max-w-[92px] lg:@[300px]/footercol:px-1.5"
          disabled={state === "submitting"}
          aria-describedby={state === "error" ? errorId : undefined}
        >
          {state === "submitting" ? "שולח..." : "שליחה"}
        </Button>
      </div>
      <input
        type="text"
        name="field_5ca8ec1"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      {state === "error" ? (
        <p id={errorId} className="text-xs text-red-300" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
