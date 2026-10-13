/**
 * Generate favicon.ico, icon-48.png, apple-touch-icon.png from brand SVG.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svgPath = path.join(ROOT, "public/media/3274-favicon.svg");
const publicDir = path.join(ROOT, "public");

async function main() {
  const svg = fs.readFileSync(svgPath);
  await sharp(svg).resize(48, 48).png().toFile(path.join(publicDir, "icon-48.png"));
  await sharp(svg).resize(180, 180).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
  await sharp(svg).resize(32, 32).png().toFile(path.join(publicDir, "favicon.ico"));
  console.log("Wrote public/icon-48.png, apple-touch-icon.png, favicon.ico");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
