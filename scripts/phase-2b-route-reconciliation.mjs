/**
 * Compare URL contract vs local crawl results
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function normalizeText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function main() {
  const contract = readJson("audit/reports/url-contract.json");
  const crawl = readJson("audit/reports/local-full-site-crawl.json");
  const inventory = readJson("audit/reports/phase-2b-site-inventory.json");

  if (!crawl) {
    console.error("Run phase-2b-local-crawl.mjs first (with server running)");
    process.exit(1);
  }

  const crawlByPath = new Map();
  for (const row of crawl.results) {
    crawlByPath.set(row.url, row);
  }

  const rows = contract.items.map((entry) => {
    const expectedPath = entry.requiredNewPath.endsWith("/")
      ? entry.requiredNewPath
      : `${entry.requiredNewPath}/`;
    const local = crawlByPath.get(expectedPath) || crawlByPath.get(entry.requiredNewPath);
    const inv = inventory?.items?.find((i) => i.decodedPathname === entry.requiredNewPath.replace(/\/$/, ""));

    let status = "MANUAL_REVIEW";
    if (!local) status = "FAIL";
    else if (entry.expectedStatus === 301) {
      status = local.httpStatus === 200 ? "EXPECTED_DIFFERENCE" : "PASS";
    } else if (local.httpStatus === 200) {
      status = "PASS";
    } else if (local.httpStatus >= 400) {
      status = "FAIL";
    }

    return {
      productionUrl: entry.oldUrl,
      expectedLocalUrl: expectedPath,
      localStatus: local?.httpStatus ?? null,
      expectedStatus: entry.expectedStatus,
      titleMatch: local ? normalizeText(local.title).includes(normalizeText(entry.expectedCanonical).slice(0, 20)) : false,
      canonicalMatch: local?.canonical?.includes("express-hovalot.co.il") ?? false,
      h1Match: local ? local.h1Count >= 1 : false,
      migrationStatus: inv?.migrationStatus ?? "UNKNOWN",
      brokenImages: local?.brokenImages ?? 0,
      status,
    };
  });

  const summary = {
    total: rows.length,
    pass: rows.filter((r) => r.status === "PASS").length,
    fail: rows.filter((r) => r.status === "FAIL").length,
    expectedDifference: rows.filter((r) => r.status === "EXPECTED_DIFFERENCE").length,
    manualReview: rows.filter((r) => r.status === "MANUAL_REVIEW").length,
  };

  fs.writeFileSync(
    path.join(ROOT, "audit/reports/phase-2b-route-reconciliation.json"),
    JSON.stringify({ generated: new Date().toISOString(), summary, rows }, null, 2),
  );

  const md = `# Phase 2B Route Reconciliation

Generated: ${new Date().toISOString()}

| Status | Count |
|--------|------:|
| PASS | ${summary.pass} |
| FAIL | ${summary.fail} |
| EXPECTED_DIFFERENCE | ${summary.expectedDifference} |
| MANUAL_REVIEW | ${summary.manualReview} |

See \`audit/reports/phase-2b-route-reconciliation.json\` for full table.
`;

  fs.writeFileSync(path.join(ROOT, "audit/reports/PHASE_2B_ROUTE_RECONCILIATION.md"), md);
  console.log(JSON.stringify(summary));
}

main();
