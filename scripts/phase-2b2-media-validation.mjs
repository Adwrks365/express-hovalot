/**
 * Media validation — map + rendered page image audit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.env.CRAWL_BASE || "http://localhost:3000";

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

async function main() {
  const mediaMap = readJson("src/content/media-map.json");
  const contract = readJson("audit/reports/url-contract.json");
  const items = mediaMap.items || [];

  const fileChecks = [];
  for (const item of items) {
    const local = item.localPath;
    const exists = local ? fs.existsSync(path.join(ROOT, "public", local.replace(/^\//, ""))) : false;
    fileChecks.push({
      id: item.id,
      localPath: local,
      sourceUrl: item.sourceUrl,
      status: !local ? "UNMAPPED" : exists ? "OK" : "MISSING",
    });
  }

  const paths = contract.items.filter((i) => i.expectedStatus === 200).map((i) => i.requiredNewPath);
  const remoteDeps = [];

  for (const p of paths.slice(0, 40)) {
    const url = `${BASE}${p.endsWith("/") ? p : `${p}/`}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
      for (const src of imgs) {
        if (src.includes("wp-content/uploads") && !src.startsWith("/media/")) {
          remoteDeps.push({ page: p, src });
        }
      }
    } catch {
      /* skip */
    }
  }

  const summary = {
    totalAssets: items.length,
    mappedOk: fileChecks.filter((f) => f.status === "OK").length,
    missing: fileChecks.filter((f) => f.status === "MISSING").length,
    unmapped: fileChecks.filter((f) => f.status === "UNMAPPED").length,
    remoteWordPressInSample: remoteDeps.length,
    legacyUnused: items.length - fileChecks.filter((f) => f.status === "OK").length,
  };

  const report = { generated: new Date().toISOString(), summary, fileChecks, remoteDeps };
  fs.writeFileSync(path.join(ROOT, "audit/reports/phase-2b2-media-validation.json"), JSON.stringify(report, null, 2));

  const md = `# Phase 2B.2 Media Validation

Generated: ${report.generated}

| Metric | Count |
|--------|------:|
| Total in media map | ${summary.totalAssets} |
| Local file OK | ${summary.mappedOk} |
| Missing local file | ${summary.missing} |
| Unmapped (no localPath) | ${summary.unmapped} |
| Remote WP deps (sample crawl) | ${summary.remoteWordPressInSample} |
`;

  fs.writeFileSync(path.join(ROOT, "audit/reports/PHASE_2B2_MEDIA_VALIDATION.md"), md);
  console.log(JSON.stringify(summary));
}

main();
