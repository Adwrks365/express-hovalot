# Forms Workflow Summary (Phase 1.5)

## CONFIRMED from live HTML sampling

Elementor form IDs extracted from rendered HTML (read-only):

| Elementor form_id | Workflow | Key fields |
|-------------------|----------|------------|
| 30f992a | Homepage lead form | name, phone, message, consent checkbox |
| af66983 | Homepage variant | name, phone, message, consent checkbox |
| 3bcec23 | Service page quote | name, phone, message, consent, honeypot field |
| e6d5b71 | Footer/minimal CTA | name (optional), phone, honeypot |
| 28b6230e | Minimal contact | name, phone |
| 488e82c0 | Article sidebar | name, phone, message |

## INFERRED

- **16 unique HTML signatures** across site map to **~6–8 distinct Elementor form_id values** (not 16 separate business workflows)
- Most forms are **global templates** (footer/sidebar) repeated on many pages
- One **non-Elementor interactive form** detected: moving calculator with `move_type` selects and elevator radio buttons (homepage)

## UNKNOWN (requires WP admin or controlled staging test)

- Email routing per form_id
- Success messages and redirect URLs
- reCAPTCHA site keys (present on site but secrets not recorded)
- Webhook/CRM integrations

## Migration-critical workflows

1. **Primary lead capture** — name + phone + optional message + consent
2. **Minimal CTA** — name + phone only (footer)
3. **Moving calculator** — multi-step select form (special functionality)
4. **Article inline forms** — name + phone + message
