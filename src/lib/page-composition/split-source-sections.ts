import * as cheerio from "cheerio";

export type SourceSection = { heading: string | null; html: string; orderIndex: number };

/**
 * Split sanitized HTML into intro + H2 sections in document order.
 * Recurses into wrapper divs (Elementor) — no semantic classification.
 */
export function splitSourceSections(html: string): {
  introHtml: string | null;
  sections: SourceSection[];
} {
  if (!html?.trim()) return { introHtml: null, sections: [] };

  const $ = cheerio.load(`<div id="pc-root">${html}</div>`, {}, false);
  const root = $("#pc-root");

  const beforeH2: string[] = [];
  const rawSections: { heading: string | null; html: string }[] = [];
  let currentHeading: string | null = null;
  let currentNodes: string[] = [];

  const flushSection = () => {
    const body = currentNodes.join("").trim();
    if (body || currentHeading) rawSections.push({ heading: currentHeading, html: body });
    currentHeading = null;
    currentNodes = [];
  };

  const walk = (container: ReturnType<typeof $>) => {
    container.contents().each((_, node) => {
      if (node.type === "tag" && node.tagName === "h2") {
        flushSection();
        currentHeading = $(node).text().replace(/\s+/g, " ").trim();
        return;
      }
      if (node.type === "tag") {
        const $node = $(node);
        if ($node.find("h2").length > 0) {
          walk($node);
          return;
        }
      }
      const chunk =
        node.type === "tag"
          ? $.html(node) || ""
          : node.type === "text"
            ? node.data || ""
            : "";
      if (!chunk.trim()) return;
      if (currentHeading !== null || rawSections.length > 0 || beforeH2.length > 0) {
        currentNodes.push(chunk);
      } else {
        beforeH2.push(chunk);
      }
    });
  };

  walk(root);
  flushSection();

  if (rawSections.length === 0 && !beforeH2.length) {
    const body = root.html()?.trim() || "";
    if (body) {
      return {
        introHtml: null,
        sections: [{ heading: null, html: body, orderIndex: 0 }],
      };
    }
  }

  const sections = rawSections.map((s, i) => ({ ...s, orderIndex: i }));

  return { introHtml: beforeH2.join("").trim() || null, sections };
}

export function sectionToHtml(section: SourceSection): string {
  if (section.heading && !section.html.includes("<h2")) {
    return `<h2>${section.heading}</h2>\n${section.html}`;
  }
  if (section.heading && !section.html.trim()) {
    return `<h2>${section.heading}</h2>`;
  }
  return section.html;
}
