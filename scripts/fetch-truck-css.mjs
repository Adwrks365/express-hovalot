import fs from "fs";

const html = fs.readFileSync("audit/tmp-prod-home.html", "utf8");
const cssUrls = [...html.matchAll(/href="([^"]*post-2701[^"]*\.css[^"]*)"/g)].map((m) => m[1]);
console.log("CSS URLs:", cssUrls);

if (cssUrls[0]) {
  const url = cssUrls[0].startsWith("http") ? cssUrls[0] : `https://express-hovalot.co.il${cssUrls[0]}`;
  const css = await fetch(url).then((r) => r.text());
  fs.writeFileSync("audit/tmp-post-2701.css", css);
  const rules = css
    .split("}")
    .filter((r) => /22e046e|352f056|162650a|c7e7a49|bf6de8b/.test(r))
    .map((r) => r.trim() + "}");
  console.log(rules.join("\n\n"));
}
