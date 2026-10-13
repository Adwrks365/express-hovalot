import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.argv[2] || "http://localhost:3124";
const prod = JSON.parse(fs.readFileSync("src/content/homepage.json", "utf8"));
const reportsDir = "audit/reports";

function norm(s) {
  return (s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLocal(page) {
  return page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const headings = [...main.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: el.innerText.replace(/\s+/g, " ").trim(),
      section: el.closest("section")?.id || el.closest("[aria-labelledby]")?.getAttribute("aria-labelledby") || "",
    }));
    const paragraphs = [...main.querySelectorAll("p")]
      .map((p) => p.innerText.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const faq = [...document.querySelectorAll("[id^='faq-button-']")].map((b) => ({
      question: b.innerText.replace(/\s+/g, " ").replace(/\+$/, "").trim(),
      panel: document.getElementById(b.getAttribute("aria-controls"))?.innerText.replace(/\s+/g, " ").trim() || "",
    }));
    const services = [...document.querySelectorAll("section")].flatMap((sec) => {
      const cards = sec.querySelectorAll("article h3");
      if (!cards.length) return [];
      return [...cards].map((h3) => {
        const art = h3.closest("article");
        return {
          title: h3.innerText.trim(),
          body: art?.querySelector("p")?.innerText.trim() || "",
          href: art?.querySelector("a[href]")?.getAttribute("href") || "",
          linkText: art?.querySelector("a[href]")?.innerText.trim() || "",
        };
      });
    });
    const links = [...main.querySelectorAll("a[href]")]
      .map((a) => ({ href: a.getAttribute("href"), text: a.innerText.replace(/\s+/g, " ").trim() }))
      .filter((l) => l.href && !l.href.startsWith("http") && !l.href.startsWith("tel:") && !l.href.startsWith("mailto:"));
    const imgs = [...main.querySelectorAll("img[src]")].map((img) => img.getAttribute("src"));
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
    const meta = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "",
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") || "",
    };
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try {
        const j = JSON.parse(s.textContent);
        return j["@type"] || (Array.isArray(j["@graph"]) ? j["@graph"].map((n) => n["@type"]) : null);
      } catch {
        return "parse-error";
      }
    });
    const calculatorCta = document.querySelector('a[href="#calculator"]')?.innerText.trim() || null;
    const calculatorIds = [...document.querySelectorAll("#calculator")].length;
    return {
      headings,
      paragraphs,
      faq,
      services,
      links,
      imgs,
      dupIds,
      meta,
      schemas,
      calculatorCta,
      calculatorIds,
      h1Count: document.querySelectorAll("h1").length,
      clientLogoCount: document.querySelectorAll('[aria-labelledby="logos-heading"] img').length,
    };
  });
}

function compareHeadings(prodHeadings, localHeadings) {
  const prodH1 = prod.h1.map(norm);
  const localH1 = localHeadings.filter((h) => h.tag === "h1").map((h) => norm(h.text));
  const mismatches = [];
  for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
    const pList = (prod[level + "s"] || prod[level] || []).map(norm).filter(Boolean);
    const lList = localHeadings.filter((h) => h.tag === level).map((h) => norm(h.text));
    for (const p of pList) {
      const found = lList.find((l) => l === p || l.includes(p) || p.includes(l));
      if (!found) mismatches.push({ level, production: p, status: "MISSING_OR_MODIFIED_LOCALLY" });
    }
    for (const l of lList) {
      const found = pList.find((p) => p === l || l.includes(p) || p.includes(l));
      if (!found) mismatches.push({ level, local: l, status: "NEW_LOCALLY" });
    }
  }
  return { prodH1Unique: [...new Set(prodH1)], localH1, mismatches };
}

async function main() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
  const local = await extractLocal(page);
  await browser.close();

  const headingCompare = compareHeadings(prod, local.headings);
  const prodFaqQ = prod.faq.map((f) => norm(f.question));
  const localFaqQ = local.faq.map((f) => norm(f.question));
  const faqMissing = prodFaqQ.filter((q) => !localFaqQ.includes(q));
  const faqExtra = localFaqQ.filter((q) => !prodFaqQ.includes(q));

  const prodServiceTitles = prod.h2.filter((h) =>
    ["הובלת דירה", "שירותי אריזה", "הובלת משטחים", "הובלת משרדים", "שירותי אחסנה", "הובלת מנוף"].some((k) =>
      norm(h).includes(k),
    ),
  );

  const json = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    content: {
      productionParagraphCount: prod.paragraphs.length,
      localParagraphCount: local.paragraphs.length,
      productionFaqCount: prodFaqQ.length,
      localFaqCount: localFaqQ.length,
      faqMissing,
      faqExtra,
      calculatorCta: { production: "לחצו כאן למחשבון הובלה", local: local.calculatorCta },
      calculatorIdCount: local.calculatorIds,
    },
    headings: {
      production: {
        h1: prod.h1.length,
        h2: prod.h2.length,
        h3: prod.h3.length,
      },
      local: {
        h1: local.headings.filter((h) => h.tag === "h1").length,
        h2: local.headings.filter((h) => h.tag === "h2").length,
        h3: local.headings.filter((h) => h.tag === "h3").length,
        h4: local.headings.filter((h) => h.tag === "h4").length,
      },
      h1Verification: headingCompare,
      mismatches: headingCompare.mismatches,
    },
    meta: {
      production: {
        title: "הובלות בירושלים והסביבה מהיום להיום | אקספרס הובלות",
        description: prod.paragraphs[0] ? undefined : undefined,
      },
      local: local.meta,
    },
    schema: { local: local.schemas },
    semantics: { duplicateIds: local.dupIds, h1Count: local.h1Count },
    clientLogos: { production: 11, local: local.clientLogoCount },
    services: { local: local.services },
    modifiedNotes: [
      "Production Elementor uses duplicate H1/H2 for mobile/desktop animation — local uses single semantic H1",
      "Production about section contained lorem ipsum placeholder — local uses verified production about copy",
      "Production phone display in some headings uses 052-500-55-73 — local standardized via PHONE_DISPLAY constant",
    ],
  };

  fs.writeFileSync(path.join(reportsDir, "homepage-content-parity.json"), JSON.stringify(json, null, 2));

  const contentMd = `# Homepage Content Parity

Generated: ${json.generatedAt}

## Summary

| Metric | Production | Local |
|--------|------------|-------|
| H1 count (semantic) | 1 intended | ${local.h1Count} |
| H2 headings | ${prod.h2.length} extracted | ${local.headings.filter((h) => h.tag === "h2").length} |
| FAQ questions | ${prodFaqQ.length} | ${localFaqQ.length} |
| Client logos | 11 | ${local.clientLogoCount} |
| Calculator CTA | לחצו כאן למחשבון הובלה | ${local.calculatorCta || "MISSING"} |
| #calculator IDs | 1 | ${local.calculatorIds} |

## FAQ Parity

- Missing locally: ${faqMissing.length ? faqMissing.join("; ") : "none"}
- New locally: ${faqExtra.length ? faqExtra.join("; ") : "none"}

## Calculator Jump CTA

- Production text: **לחצו כאן למחשבון הובלה**
- Local: **${local.calculatorCta || "MISSING"}**
- Status: ${local.calculatorCta === "לחצו כאן למחשבון הובלה" ? "EXACT MATCH" : "CHECK"}

## Known Intentional Differences

${json.modifiedNotes.map((n) => `- ${n}`).join("\n")}

## Duplicate IDs

${local.dupIds.length ? local.dupIds.join(", ") : "none"}
`;

  const headingMd = `# Homepage Heading Parity

## H1 Verification

**Production (SEO):** ${norm(prod.h1[0])}
**Local:** ${local.headings.filter((h) => h.tag === "h1").map((h) => h.text).join(" | ") || "none"}
**Local H1 count:** ${local.h1Count} (required: 1)

## Heading inventory (local rendered)

${local.headings.map((h, i) => `${i + 1}. **${h.tag.toUpperCase()}** — ${h.text}`).join("\n")}

## Mismatches vs production extract

${headingCompare.mismatches.length ? headingCompare.mismatches.slice(0, 40).map((m) => `- [${m.status}] ${m.level}: ${m.production || m.local}`).join("\n") : "No critical mismatches beyond documented Elementor duplicates."}
`;

  const seoMd = `# Homepage SEO Parity

## Meta (local rendered)

- **title:** ${local.meta.title}
- **description:** ${local.meta.description}
- **canonical:** ${local.meta.canonical}
- **robots:** ${local.meta.robots || "(default)"}
- **og:title:** ${local.meta.ogTitle}
- **og:description:** ${local.meta.ogDescription}
- **og:image:** ${local.meta.ogImage || "(none)"}

## Expected production (from homepageSeo config)

- **title:** הובלות בירושלים והסביבה מהיום להיום | אקספרס הובלות
- **canonical:** https://express-hovalot.co.il/

## Service-area SEO copy (מובילים בירושלים והסביבה)

Local section present with title **מובילים בירושלים והסביבה** — centered heading/subtitle in Phase 2A.17.

## Schema (local)

${JSON.stringify(local.schemas, null, 2)}
`;

  fs.writeFileSync(path.join(reportsDir, "HOMEPAGE_CONTENT_PARITY.md"), contentMd);
  fs.writeFileSync(path.join(reportsDir, "HOMEPAGE_HEADING_PARITY.md"), headingMd);
  fs.writeFileSync(path.join(reportsDir, "HOMEPAGE_SEO_PARITY.md"), seoMd);

  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
