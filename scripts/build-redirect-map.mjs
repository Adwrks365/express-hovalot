/**
 * Build redirect map from URL contract
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contract = JSON.parse(
  fs.readFileSync(path.join(ROOT, "audit/reports/url-contract.json"), "utf8"),
);

const redirects = contract.items
  .filter((item) => item.expectedStatus === 301)
  .map((item) => ({
    source: new URL(item.oldUrl).pathname.replace(/\/$/, "") || "/",
    destination: item.requiredNewPath.endsWith("/")
      ? item.requiredNewPath
      : `${item.requiredNewPath}/`,
    status: 301,
    reason: item.notes || "Canonical trailing-slash variant",
  }));

const out = {
  generated: new Date().toISOString(),
  count: redirects.length,
  redirects,
};

fs.writeFileSync(path.join(ROOT, "audit/reports/redirect-map.json"), JSON.stringify(out, null, 2));

const md = `# Redirect Map

Generated: ${out.generated}

| Source | Destination | Status | Reason |
|--------|-------------|--------|--------|
${redirects.map((r) => `| \`${r.source}\` | \`${r.destination}\` | ${r.status} | ${r.reason} |`).join("\n")}
`;

fs.writeFileSync(path.join(ROOT, "audit/reports/REDIRECT_MAP.md"), md);
console.log(JSON.stringify({ count: redirects.length }));
