/**
 * Download all WordPress media library assets (READ-ONLY GET)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const AUDIT = path.join(ROOT, "audit", "media", "media-manifest.json");
const OUT_DIR = path.join(ROOT, "public", "media");
const MAP_FILE = path.join(ROOT, "src", "content", "media-map.json");
const DELAY = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeLocalName(id, url) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname);
    const ext = path.extname(base) || ".bin";
    const name = base.replace(/[^\w.\-א-ת\u0590-\u05FF]/gi, "_") || `media-${id}${ext}`;
    return `${id}-${name}`.slice(0, 180);
  } catch {
    return `media-${id}.bin`;
  }
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(AUDIT, "utf8"));
  const library = manifest.library || [];
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const mapping = [];
  let ok = 0;
  let fail = 0;

  for (const item of library) {
    const localFile = safeLocalName(item.id, item.url);
    const localPath = `/media/${localFile}`;
    const dest = path.join(OUT_DIR, localFile);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      mapping.push({ id: item.id, sourceUrl: item.url, localPath, alt: item.alt || "", title: item.title || "" });
      ok++;
      continue;
    }

    await sleep(DELAY);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      mapping.push({ id: item.id, sourceUrl: item.url, localPath, alt: item.alt || "", title: item.title || "" });
      ok++;
    } catch (e) {
      fail++;
      mapping.push({ id: item.id, sourceUrl: item.url, localPath: null, error: String(e.message || e) });
    }
  }

  fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify({ generated: new Date().toISOString(), total: library.length, ok, fail, items: mapping }, null, 2));
  console.log(JSON.stringify({ total: library.length, ok, fail }));
}

main();
