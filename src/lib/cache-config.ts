/**
 * ISR / Full Route Cache interval for marketing pages (content updates via deploy).
 * Route segment config must use the literal `3600` — Next.js does not allow imported values for `revalidate`.
 */
export const PAGE_REVALIDATE_SECONDS = 3600;
