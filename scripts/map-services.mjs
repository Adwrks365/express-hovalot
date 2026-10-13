import fs from "fs";

const h = JSON.parse(fs.readFileSync("src/content/data/homepage-source.json", "utf8")).contentHtml;
const titles = [
  "הובלת דירה בירושלים",
  "שירותי אריזה בירושלים",
  "הובלת משטחים בירושלים",
  "הובלת משרדים בירושלים",
  "שירותי אחסנה בירושלים",
  "הובלת מנוף בירושלים",
];

for (const t of titles) {
  const i = h.indexOf(t);
  const before = h.slice(Math.max(0, i - 2000), i);
  const badgeMatch = [...before.matchAll(/wp-image-(\d+)/g)].pop();
  const photoMatch = [...before.matchAll(/wp-image-(\d+)/g)];
  const photos = photoMatch.filter((m) => m[1] !== badgeMatch?.[1]);
  console.log(JSON.stringify({ title: t, badgeId: badgeMatch?.[1], allIds: [...new Set(photoMatch.map((m) => m[1]))].slice(-3) }));
}
