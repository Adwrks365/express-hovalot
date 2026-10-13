import { type ReactNode } from "react";

export type PageDebugMeta = {
  archetype?: string;
  renderer?: string;
  rawFallback?: boolean;
  structuredBlockCount?: number;
  semanticBlockTypes?: string;
  coverageRatio?: number;
  hasRemainingFallback?: boolean;
  designedSections?: number;
  proseSections?: number;
  rawHtmlBlocks?: number;
};

/** QA-only debug attributes — DOM only, not visible (Phase 2B.4C) */
export function InternalPageShell({
  children,
  debug,
}: {
  children: ReactNode;
  debug?: PageDebugMeta;
}) {
  return (
    <div
      className="internal-page bg-white"
      data-page-archetype={debug?.archetype}
      data-renderer={debug?.renderer}
      data-raw-fallback={debug?.rawFallback ? "true" : "false"}
      data-structured-block-count={debug?.structuredBlockCount}
      data-semantic-block-types={debug?.semanticBlockTypes}
      data-coverage-ratio={debug?.coverageRatio != null ? debug.coverageRatio.toFixed(3) : undefined}
      data-remaining-fallback={debug?.hasRemainingFallback ? "true" : "false"}
      data-designed-sections={debug?.designedSections}
      data-prose-sections={debug?.proseSections}
      data-raw-html-blocks={debug?.rawHtmlBlocks}
    >
      {children}
    </div>
  );
}
