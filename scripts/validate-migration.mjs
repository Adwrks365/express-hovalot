/**
 * Migration validation scaffolding (OLD vs NEW comparison framework)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function main() {
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, "audit/reports/url-contract.json"), "utf8"));
  const pages = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/pages.json"), "utf8"));
  const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/data/posts.json"), "utf8"));
  const mediaMap = fs.existsSync(path.join(ROOT, "src/content/media-map.json"))
    ? JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/media-map.json"), "utf8"))
    : { ok: 0, fail: 0, total: 0 };

  const report = {
    generated: new Date().toISOString(),
    urlContractItems: contract.items?.length || 0,
    contentPages: pages.length,
    contentPosts: posts.length,
    mediaDownloaded: mediaMap.ok,
    mediaFailed: mediaMap.fail,
    implementedRoutes: ["/"],
    note: "Full OLD vs NEW comparison runs after remaining pages are implemented",
  };

  const out = path.join(ROOT, "audit/reports/validation-baseline.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}

main();
