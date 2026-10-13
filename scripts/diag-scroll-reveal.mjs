import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const pages = [
  "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%9C%D7%98%D7%95%D7%95%D7%97-%D7%A7%D7%A6%D7%88/",
  "/%D7%94%D7%A6%D7%A2%D7%AA-%D7%9E%D7%97%D7%99%D7%A8/",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const url of pages) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  const data = await page.evaluate(() => {
    const reveals = [...document.querySelectorAll("[data-scroll-reveal]")];
    return reveals.map((el) => ({
      h: el.getBoundingClientRect().height,
      revealed: el.classList.contains("scroll-revealed"),
      opacity: getComputedStyle(el).opacity,
      textLen: el.innerText?.length ?? 0,
    }));
  });
  console.log("\n", url, "reveals:", data.length);
  console.log("hidden:", data.filter((d) => d.opacity === "0").length);
  console.log("sample:", data.slice(0, 5));
}

await browser.close();
