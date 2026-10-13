# Trailing Slash Implementation

## Decision

Production WordPress uses trailing slashes on permalinks. The Next.js app mirrors this.

## Configuration

```typescript
// next.config.ts
trailingSlash: true
```

## Behavior

- Internal links use paths like `/about-us/` (Next.js normalizes trailing slash)
- Canonical URLs in SEO metadata include trailing slash per Yoast source
- Avoid linking to both `/path` and `/path/` — single canonical variant only

## Validation

Future `validate:migration` script compares old vs new URL status and canonical headers.
