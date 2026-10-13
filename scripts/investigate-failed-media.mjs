import fs from "node:fs";

const map = JSON.parse(fs.readFileSync("src/content/media-map.json", "utf8"));
const failed = map.items.filter((i) => !i.localPath);

async function head(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { url, status: res.status, ok: res.ok };
  } catch (e) {
    return { url, status: 0, ok: false, error: String(e.message) };
  }
}

function alternates(sourceUrl) {
  const alts = [];
  const base = sourceUrl.replace(/\.webp$/i, "");
  alts.push(`${base}.jpg`, `${base}.jpeg`, `${base}.png`);
  alts.push(sourceUrl.replace("/uploads/", "/uploads/").replace(".webp", "-scaled.webp"));
  const parts = sourceUrl.split("/");
  const file = parts.pop();
  const dir = parts.join("/");
  const name = file.replace(/\.[^.]+$/, "");
  alts.push(`${dir}/${name}-1024x768.webp`, `${dir}/${name}-768x576.webp`);
  return [...new Set(alts.filter((u) => u !== sourceUrl))];
}

const pages = JSON.parse(fs.readFileSync("src/content/data/pages.json", "utf8"));
const posts = JSON.parse(fs.readFileSync("src/content/data/posts.json", "utf8"));
const allContent = JSON.stringify([...pages, ...posts]);

const results = [];
for (const item of failed) {
  const altChecks = [];
  for (const url of alternates(item.sourceUrl)) {
    const r = await head(url);
    if (r.ok) altChecks.push({ url, status: r.status });
  }
  const referenced = allContent.includes(String(item.id)) || allContent.includes(item.sourceUrl.split("/").pop() || "");
  let classification = "D";
  if (altChecks.length > 0) classification = "A";
  else if (!referenced) classification = "B";
  else if (item.error === "HTTP 404") classification = "C";

  results.push({
    id: item.id,
    sourceUrl: item.sourceUrl,
    classification,
    alternatesFound: altChecks,
    referencedInContent: referenced,
    originalError: item.error,
  });
}

const summary = {
  generated: new Date().toISOString(),
  totalFailed: failed.length,
  byClass: {
    A: results.filter((r) => r.classification === "A").length,
    B: results.filter((r) => r.classification === "B").length,
    C: results.filter((r) => r.classification === "C").length,
    D: results.filter((r) => r.classification === "D").length,
  },
  items: results,
};

fs.writeFileSync("audit/reports/failed-media-investigation.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary.byClass));
