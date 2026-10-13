import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { MEDIA } from "@/config/media-paths";
import { mediaRoleClass } from "@/lib/layout";

const CLIENT_LOGO_IDS = new Set(
  MEDIA.clientLogos.map((l) => {
    const m = l.path.match(/\/(\d+)-/);
    return m ? m[1] : null;
  }).filter(Boolean) as string[],
);

const ICON_HINTS = /shield|badge|icon|Asset|parcel|hovalot|2759|2747|2748/i;
const LOGO_HINTS = /adidas|aldo|Castro|Elbit|bitahon|2354|2355|2356|2357|2358|2359|2360|2361|2363|2364|2365/i;
const AVATAR_HINTS = /team|portrait|profile|author|צוות|עובד/i;

function isImageOnlyNode($: cheerio.CheerioAPI, $node: cheerio.Cheerio<Element>) {
  return (
    $node.is("img") ||
    ($node.children("img").length === 1 && !$node.text().replace(/\s+/g, "").trim())
  );
}

function groupConsecutiveSiblingImages($: cheerio.CheerioAPI) {
  $("*")
    .addBack()
    .each((_, el) => {
      if (!("tagName" in el) || el.type !== "tag") return;
      const $parent = $(el);
      const children = $parent.children().toArray();
      if (children.length < 2) return;

      let i = 0;
      while (i < children.length) {
        const childEl = children[i];
        if (!childEl || !("tagName" in childEl) || !isImageOnlyNode($, $(childEl as Element))) {
          i++;
          continue;
        }
        let j = i + 1;
        while (j < children.length) {
          const nextEl = children[j];
          if (!nextEl || !("tagName" in nextEl) || !isImageOnlyNode($, $(nextEl as Element))) break;
          j++;
        }
        if (j - i < 2) {
          i++;
          continue;
        }

        const $gallery = $('<div class="rich-text-image-gallery"></div>');
        for (let k = i; k < j; k++) {
          const $node = $(children[k]);
          if ($node.is("img")) $gallery.append($node.clone());
          else $gallery.append($node.children("img").first().clone());
          $node.remove();
        }
        const remaining = $parent.children().toArray();
        if (i < remaining.length) $(remaining[i]).before($gallery);
        else $parent.append($gallery);

        const galleryEl = $gallery.get(0);
        if (galleryEl && "tagName" in galleryEl) children.splice(i, j - i, galleryEl as Element);
        i++;
      }
    });
}

function groupConsecutiveImageBlocks($: cheerio.CheerioAPI, tag: "p" | "div") {
  $(tag).each((_, el) => {
    const $node = $(el);
    if ($node.closest(".rich-text-image-gallery, .rich-text-logo-cluster").length) return;
    if ($node.children("img").length !== 1 || $node.text().replace(/\s+/g, "").trim()) return;
    const $prev = $node.prev(tag);
    if ($prev.length && $prev.children("img").length === 1 && !$prev.text().replace(/\s+/g, "").trim()) {
      return;
    }

    const nodes = [$node];
    let $cursor = $node.next(tag);
    while (
      $cursor.length &&
      $cursor.children("img").length === 1 &&
      !$cursor.text().replace(/\s+/g, "").trim()
    ) {
      nodes.push($cursor);
      $cursor = $cursor.next(tag);
    }
    if (nodes.length < 2) return;

    const $gallery = $('<div class="rich-text-image-gallery"></div>');
    nodes.forEach(($n) => {
      $gallery.append($n.children("img").clone());
      $n.remove();
    });
    if ($cursor.length) $cursor.before($gallery);
    else $.root().append($gallery);
  });
}

function classifyImageSrc(src: string, alt: string): keyof typeof mediaRoleClass | "content" {
  const hay = `${src} ${alt}`;
  if (CLIENT_LOGO_IDS.has(src.match(/\/(\d+)-/)?.[1] || "") || LOGO_HINTS.test(hay)) return "logo";
  if (ICON_HINTS.test(hay)) return "icon";
  if (AVATAR_HINTS.test(hay)) return "avatar";
  return "content";
}

/** Strip Elementor presentational inline font sizes and widths */
export function stripPresentationalInlineStyles(html: string): string {
  if (!html?.trim()) return "";
  const $ = cheerio.load(html, {}, false);

  $("[style]").each((_, el) => {
    const $el = $(el);
    const style = $el.attr("style") || "";
    const cleaned = style
      .replace(/font-size\s*:\s*[^;]+;?/gi, "")
      .replace(/line-height\s*:\s*[^;]+;?/gi, "")
      .replace(/width\s*:\s*[^;]+;?/gi, "")
      .replace(/height\s*:\s*[^;]+;?/gi, "")
      .replace(/max-width\s*:\s*[^;]+;?/gi, "")
      .replace(/min-height\s*:\s*[^;]+;?/gi, "")
      .replace(/margin-top\s*:\s*\d{2,}px;?/gi, "")
      .replace(/margin-bottom\s*:\s*\d{2,}px;?/gi, "")
      .replace(/padding-top\s*:\s*\d{2,}px;?/gi, "")
      .replace(/padding-bottom\s*:\s*\d{2,}px;?/gi, "")
      .trim();
    if (cleaned) $el.attr("style", cleaned);
    else $el.removeAttr("style");
  });

  return $.root().html() || "";
}

/** Classify images by role and wrap logo/profile clusters before RichText render */
export function enrichRichTextHtml(html: string): string {
  if (!html?.trim()) return "";

  let out = stripPresentationalInlineStyles(html);
  const $ = cheerio.load(out, {}, false);

  $("img").each((_, el) => {
    const $img = $(el);
    const src = $img.attr("src") || "";
    const alt = $img.attr("alt") || "";
    const role = classifyImageSrc(src, alt);
    $img.removeClass("rich-text-image");
    $img.addClass(mediaRoleClass[role === "content" ? "contentMedium" : role]);
    if (role === "icon" || role === "logo") {
      $img.addClass("rich-text-image");
    }
  });

  groupConsecutiveImageBlocks($, "p");
  groupConsecutiveImageBlocks($, "div");
  groupConsecutiveSiblingImages($);

  // Logo clusters — container holds only logo images (no mixed prose)
  $("p, div").each((_, el) => {
    const $el = $(el);
    if ($el.hasClass("rich-text-image-gallery")) return;
    const kids = $el.children().toArray();
    if (kids.length < 2) return;
    if (!kids.every((k) => "tagName" in k && isImageOnlyNode($, $(k as Element)))) return;
    const allLogos = kids.every((k) => {
      const src = $(k as Element).is("img")
        ? $(k as Element).attr("src") || ""
        : $(k as Element).find("img").attr("src") || "";
      const alt = $(k as Element).find("img").attr("alt") || $(k as Element).attr("alt") || "";
      return classifyImageSrc(src, alt) === "logo";
    });
    if (allLogos) $el.addClass("rich-text-logo-cluster");
  });

  // Portrait stacks — group avatar images into responsive grid
  $("p, div").each((_, el) => {
    const $el = $(el);
    const avatars = $el.find("> img").filter((__, img) => $(img).hasClass(mediaRoleClass.avatar));
    if (avatars.length >= 2) {
      $el.addClass("rich-text-profile-cluster");
    }
  });

  // Feature icon rows — multiple icons without section heading
  $("div, section").each((_, el) => {
    const $el = $(el);
    const iconImgs = $el.find(`> img.${mediaRoleClass.icon}, > .${mediaRoleClass.icon}`);
    if (iconImgs.length >= 2 && $el.find("> h2, > h3, > h4").length === 0) {
      $el.addClass("rich-text-icon-row");
    }
  });

  out = $.root().html() || "";
  return out;
}
