/**
 * Download homepage-critical media only (READ-ONLY GET from production CDN)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MAP = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/media-map.json"), "utf8"));
const OUT = path.join(ROOT, "public/media");

const IDS = [
  2748, 2311, 2747, 2312, 2313, 2759, 2597, 2561, 3995,
  3517, 3506, 3516, 3509, 3586, 3587, 3588,
  3239, 3252, 3538, 3537,
  2354, 2355, 2356, 2357, 2358, 2359, 2360, 2361, 2363, 2364, 2365,
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0;
  let fail = 0;
  for (const id of IDS) {
    const item = MAP.items.find((x) => x.id === id);
    if (!item?.sourceUrl || !item.localPath) {
      console.error("missing map", id);
      fail++;
      continue;
    }
    const dest = path.join(ROOT, "public", item.localPath.replace(/^\//, ""));
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      ok++;
      continue;
    }
    try {
      const res = await fetch(item.sourceUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      console.log("ok", id, item.localPath);
      ok++;
    } catch (e) {
      console.error("fail", id, e.message);
      fail++;
    }
  }
  console.log(JSON.stringify({ ok, fail }));
}

main();
