# Forms Architecture

## Approved recipients (env-based)

```
CONTACT_RECIPIENTS=shinua30@gmail.com,info@adwrks.co.il
CONTACT_EMAIL_ENABLED=true
RESEND_API_KEY=re_...
RESEND_FROM=Express Hovalot <leads@express-hovalot.co.il>
```

Recipients are read server-side via `getContactRecipients()` — never hardcoded in UI components.

## Behavior

- `POST /api/contact` validates input, honeypot, sanitization
- When `CONTACT_EMAIL_ENABLED=true` and Resend is configured, sends one email to all `CONTACT_RECIPIENTS` with full field + page attribution
- When email is disabled, returns success without sending (local dev)

## Components

| Component | Purpose |
|-----------|---------|
| `QuoteForm` | Homepage / quote fields from audit |
| `CalculatorSection` | Moving calculator UI scaffold (client-side estimate only) |

## Audited Elementor form intent preserved

Fields: name, phone, email, from/to address, move date, message.

Future: reCAPTCHA server verification when keys configured.

## Email provider

[Resend](https://resend.com) via `src/lib/contact/send-lead-email.ts`. Domain `express-hovalot.co.il` must be verified in Resend for `RESEND_FROM`.
