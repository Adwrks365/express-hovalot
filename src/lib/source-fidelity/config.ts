/**
 * Phase 2B.5 — Source fidelity mode.
 * When enabled, page body renders production HTML in order without semantic inference.
 */
export function isSourceFidelityEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SOURCE_FIDELITY !== "false";
}

/** @deprecated Use `isSourceFidelityEnabled` — not a React hook. */
export const useSourceFidelityRenderer = isSourceFidelityEnabled;
