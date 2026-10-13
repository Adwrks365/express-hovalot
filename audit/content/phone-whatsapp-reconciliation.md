# Phone / WhatsApp Reconciliation

## Primary Business Number

**CONFIRMED:** Single phone number `052-500-5573` (international: +972525005573)

## Phone Link Variants

| Variant type | Example | Assessment |
|--------------|---------|------------|
| Formatted tel | `tel:052-500-5573` | Formatting only |
| Unformatted tel | `tel:0525005573` | Formatting only |
| Spaced tel | `tel:052-500-55-73` | Formatting only |
| URL-encoded spaces | `tel:0525005573%20%20` | **Formatting artifact** — `%20` appended to href creates false duplicate in digit parsing |

**CONFIRMED:** No multiple phone numbers — only formatting/encoding differences.

## WhatsApp

**CONFIRMED:** Single destination number `972525005573`

| Variant | Assessment |
|---------|------------|
| `wa.me/972525005573` | Standard |
| `wa.me/0525005573` | Same number, local format |
| Different `?text=` prefill messages | Same destination, different CTA copy |

**CONFIRMED:** WhatsApp variants are formatting/message differences only — **not** different numbers.

## Migration Recommendation

Standardize to canonical formats during Next.js build (with explicit approval):
- Phone display: `052-500-5573`
- tel link: `tel:+972525005573`
- WhatsApp: `https://wa.me/972525005573`
