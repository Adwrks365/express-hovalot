/**
 * Extract structured homepage content from live page (GET only)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "src", "content", "homepage.json");

async function main() {
  const res = await fetch("https://express-hovalot.co.il/");
  const html = await res.text();
  const $ = cheerio.load(html);

  const h1 = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2 = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h3 = $("h3").map((_, el) => $(el).text().trim()).get().filter(Boolean);

  const paragraphs = [];
  $("p").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t.length > 20) paragraphs.push(t);
  });

  const serviceLinks = [];
  $('a[href*="express-hovalot"]').each((_, a) => {
    const href = $(a).attr("href") || "";
    const text = $(a).text().trim();
    if (text && href.includes("express-hovalot") && !href.endsWith("/") && text.length < 60) {
      serviceLinks.push({ text, href: href.replace("https://express-hovalot.co.il", "") });
    }
  });

  const faq = [];
  $("details, .elementor-accordion-item, .e-n-accordion-item").each((_, el) => {
    const q = $(el).find("summary, .elementor-accordion-title, .e-n-accordion-item-title").first().text().trim();
    const a = $(el).find(".elementor-accordion-content, .e-con-inner p").first().text().trim();
    if (q) faq.push({ question: q, answer: a });
  });

  const images = [];
  $("img").each((_, img) => {
    const src = $(img).attr("src") || "";
    if (src.includes("wp-content/uploads")) {
      images.push({ src, alt: $(img).attr("alt") || "" });
    }
  });

  const data = {
    extractedAt: new Date().toISOString(),
    h1: [...new Set(h1)],
    h2: [...new Set(h2)].slice(0, 20),
    h3: [...new Set(h3)].slice(0, 20),
    paragraphs: [...new Set(paragraphs)].slice(0, 30),
    faq: faq.slice(0, 15),
    images: images.slice(0, 40),
    serviceLinks: [...new Map(serviceLinks.map((s) => [s.href, s])).values()].slice(0, 24),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
  console.log(JSON.stringify({ h1: data.h1.length, h2: data.h2.length, paragraphs: data.paragraphs.length, faq: data.faq.length }));
}

main();
