/**
 * One-shot: append weekly SEO article to posts.json + url-contract.json
 * Run: node scripts/add-weekly-article-hovla-achsana.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS = path.join(ROOT, "src/content/data/posts.json");
const CONTRACT = path.join(ROOT, "src/content/data/url-contract.json");

const slug = "הדירה-החדשה-לא-מוכנה-הובלה-ואחסון-תכולה-בירושלים";
const pathSlug = `/${slug}`;
const title = "הדירה החדשה עדיין לא מוכנה? כך משלבים הובלה ואחסון תכולה בירושלים";
const canonical = `https://express-hovalot.co.il/${slug}/`;
const now = "2026-11-13T09:00:00";

function widgetText(html) {
  return `<div class="elementor-element elementor-widget elementor-widget-text-editor" data-element_type="widget" data-widget_type="text-editor.default"><div class="elementor-widget-container">${html}</div></div>`;
}

function widgetHeading(h2) {
  return `<div class="elementor-element elementor-widget elementor-widget-heading" data-element_type="widget" data-widget_type="heading.default"><div class="elementor-widget-container"><h2 class="elementor-heading-title elementor-size-default">${h2}</h2></div></div>`;
}

function widgetImage(id, alt, src) {
  return `<div class="elementor-element elementor-widget elementor-widget-image" data-element_type="widget" data-widget_type="image.default"><div class="elementor-widget-container"><img loading="lazy" decoding="async" width="800" height="533" src="${src}" class="attachment-large size-large wp-image-${id}" alt="${alt.replace(/"/g, "&quot;")}" /></div></div>`;
}

const body = [
  widgetText(
    `<p>מעבר דירה בירושלים לא תמיד מתקדם לפי לוח שנה אחד. לפעמים צריך לפנות את הדירה הישנה ביום מסוים, בעוד שהדירה החדשה עדיין לא מוכנה לכניסה — בגלל עיכוב במסירה, שיפוץ או התאמה בין חוזי השכירות. במצב כזה, <strong>הובלה ואחסנה בירושלים</strong> הופכים לשילוב מעשי: מעבירים את התכולה בבטחה, שומרים על כל מה שחשוב, ומתזמנים את ההמשך בלי לדחוף את המשפחה לדיור זמני עמוס.</p><p>מדריך זה מסביר מתי כדאי לשלב <strong>הובלת דירה עם אחסון</strong>, איך לתכנן את התהליך, ומה כדאי לברר לפני שבוחרים פתרון — בלי לתלות את המעבר ב"קסמים" לוגיסטיים.</p>`,
  ),
  widgetHeading("מתי צריך לשלב הובלה עם אחסון תכולה?"),
  widgetText(
    `<p>השילוב רלוונטי כשיש פער זמן בין פינוי לכניסה. בירושלים מצבים כאלה נפוצים במיוחד כשמועד מסירת מפתח נדחה, כשהשכנים החדשים עדיין בדירה, או כשמתחיל שיפוץ לפני הכניסה.</p><ul><li><strong>פער בין מועדי פינוי וכניסה</strong> — צריך לפנות, אבל אין עדיין מקום מוכן.</li><li><strong>שיפוץ בדירה החדשה או הישנה</strong> — רהיטים וחפצים עלולים לחסום עבודה או להיפגע מאבק.</li><li><strong>מעבר זמני</strong> — לינה אצל משפחה, דירה קטנה יותר או פתרון ביניים.</li><li><strong>המתנה למסירת דירה</strong> — עד שנחתם טופס מסירה או הושלמו בדיקות.</li></ul><p>במקרים כאלה <a href="/אחסון-תכולה-לטווח-קצר/">אחסון זמני לפני מעבר דירה</a> מאפשר להפריד בין יום הפינוי לבין הכניסה בפועל, במקום להעמיס הכל על דיור זמני שלא מתאים לנפח התכולה.</p>`,
  ),
  widgetHeading("איך מתכננים הובלת דירה עם אחסון זמני?"),
  widgetText(
    `<p>תכנון טוב מתחיל במיפוי: מה עובר מיד לדירה החדשה, מה נכנס לאחסון, ומה נמכר או נמסר. כך מונעים הובלה כפולה מיותרת ומורידים לחץ ביום המעבר.</p><ol><li><strong>מיון ותיוג</strong> — מסמנים קרטונים לפי "לאחסון", "לדירה החדשה" ו"אחרי שיפוץ".</li><li><strong>אריזה מותאמת</strong> — ריהוט וחפצים שיישארו במחסן דורשים אריזה שתמיד גם לתנועה במשאית וגם לעמידה לאורך זמן. ניתן לשלב <a href="/חברת-אריזה-והובלה-בירושלים/">שירותי אריזה והובלה</a> לפי הצורך.</li><li><strong>תיאום הובלה ראשונה</strong> — <a href="/הובלת-דירה-בירושלים/">הובלת הדירה</a> מהבית ישירות לאתר האחסון, בזמן שמתאים לכם ולגישה למחסן.</li><li><strong>אחסון מסודר</strong> — דירוג תכולה במחסן (למשל רהיטים, קרטונים, ציוד עונתי) כדי שתדעו מה נגיש מהר.</li><li><strong>הובלה שנייה ליעד הסופי</strong> — כשהדירה מוכנה, מעבירים מהמחסן לכתובת החדשה בתיאום מראש.</li></ol><p>כדאי לרשום בכתב מועדי יעד משוערים ולהשאיר חלון גמישות — עיכוב של שבוע בירושלים הוא לא נדיר, ולוח זמנים ריאלי חוסך טעויות יקרות.</p>`,
  ),
  widgetImage(
    3983,
    "ארגזים וריהוט מוכנים לאחסון תכולת דירה בירושלים במעבר דירה",
    "https://express-hovalot.co.il/wp-content/uploads/2025/06/2.webp",
  ),
  widgetHeading("מה חשוב לבדוק לפני שמאחסנים תכולת דירה?"),
  widgetText(
    `<p>החלטה על <strong>אחסון תכולת דירה בירושלים</strong> צריכה להתבסס על תנאים שמתאימים לסוג הציוד שלכם — לא רק על מחיר או מרחק.</p><ul><li><strong>תנאי אחסון</strong> — יבשות, ניקיון ויישור של הרצפה מונעים ריחות ועיוותים ברהיטים.</li><li><strong>אבטחה וגישה</strong> — חשוב להבין מי יכול להיכנס למתחם, ומה שעות הפעילות בהן ניתן להוציא פריטים.</li><li><strong>נגישות לציוד</strong> — אם תצטרכו מזרון, מקומון או ארון באמצע התקופה, ודאו שהם לא נשמרים מאחור בערימה.</li><li><strong>אריזה מתאימה</strong> — ריהוט מכוסה, מזרנים בעמידה אנכית (כשמתאים), וקרטונים סגורים ומתויגים.</li><li><strong>ביטוח וכיסוי</strong> — שאלו מה הכלול בהצעה, מה דורש רישום מראש של פריטי ערך, ואילו מגבלות חלות בזמן אחסון והובלה. אל תניחו כיסוי מלא בלי אימות בכתב.</li></ul><p>פרטים מסחריים — זמינות 24/7, מבנה המתחם וכדומה — משתנים בין ספקים; בדקו אותם מול הצעת השירות הספציפית, לא לפי תיאור כללי באינטרנט.</p>`,
  ),
  widgetHeading("מה משפיע על מחיר הובלה בשילוב אחסנה?"),
  widgetText(
    `<p>אין מחיר אחד לכולם: השילוב נבנה ממספר שכבות שירות. הגורמים העיקריים שבדקו מול חברת ההובלות והאחסון:</p><ul><li><strong>נפח התכולה</strong> — מספר חדרים, כמות קרטונים וריהוט גדול.</li><li><strong>משך האחסון</strong> — ימים, שבועות או חודשים (לטווח קצר לעומת <a href="/אחסון-תכולה-לטווח-ארוך/">אחסון ארוך טווח</a>).</li><li><strong>מרחקי הובלה</strong> — מדירה למחסן וממחסן לדירה החדשה, כולל יישובים בסביבת ירושלים.</li><li><strong>מספר שלבי ההובלה</strong> — הובלה אחת ישירה לעומת שני צאתיים או שלושה.</li><li><strong>קומות, מעליות וחניה</strong> — בירושלים הגורמים האלה משפיעים על זמן העבודה ועל הצורך בציוד נוסף.</li><li><strong>אריזה ופריקה</strong> — עבודה עצמית לעומת צוות מקצועי.</li></ul><p>להערכת עלות ההובלה בלבד, אפשר להיעזר ב<a href="/מחירי-הובלת-דירות/">מחירון הובלת דירות</a> ולבקש הצעת מחיר שמתייחסת גם לאחסון — כך התמונה מלאה לפני שמתחייבים.</p>`,
  ),
  widgetHeading("הובלה ואחסון בירושלים – מה חשוב לקחת בחשבון?"),
  widgetText(
    `<p>ירושלים מוסיפה שכבת תיאום: רחובות צרים, חניה מוגבלת, בניינים ישנים בלי מעלית ושכונות עם שעות מועדפות לעומס. כשמוסיפים מחסן, חשוב לחבר את לוח המעבר, את יום ההובלה ואת חלונות הגישה למחסן.</p><ul><li>תיאום <strong>תו חניה או עמדת פריקה</strong> ביום ההובלה (כשאפשר).</li><li>בחירה בין <a href="/אחסון-תכולה-בירושלים/">פתרונות אחסון בירושלים</a> ו<a href="/אחסון-תכולת-דירה/">אחסון תכולת דירה</a> לפי משך ונפח.</li><li>הפרדה בין מה שנחוץ מיד בדירה הזמנית לבין מה שנכנס למחסן.</li></ul><p>ככל שהתכנון מוקדם יותר, כך קל יותר לשמור על יום פינוי רגוע — גם כשהדירה החדשה עדיין לא מוכנה.</p>`,
  ),
  widgetHeading("שאלות נפוצות"),
  widgetText(
    `<h3>האם אפשר להעביר את כל תכולת הדירה ישירות למחסן?</h3><p>כן. הובלה ישירה מדירת המקור לאתר אחסון היא פתרון שכיח כשאין יעד סופי מוכן. חשוב לתכנן מיון מראש, כי לא כל הפריטים חייבים להישאר במחסן לאורך כל התקופה.</p><h3>איך אורזים רהיטים לפני אחסון?</h3><p>עוטפים פינות ומשטחים חשופים, מגינים מפני אבק ולחות, מפרקים פריטים גדולים כשצריך, ומסמנים קרטונים לפי חדר ורמת עדיפות. פריטים שבירים או יקרי ערך דורשים עטיפה כפולה והקפדה על עמידה יציבה במשאית.</p><h3>מה קורה אם מועד הכניסה לדירה החדשה נדחה?</h3><p>בדקו מראש האם ניתן להאריך את תקופת האחסון ומה קורה בהארכה מבחינת תשלום וגישה. לוח זמנים גמיש מפחית לחץ — במיוחד כשמסירת דירה או שיפוץ באיחור.</p><h3>כיצד מתכננים הובלה בשני שלבים?</h3><p>שלב ראשון: הובלה מהבית למחסן בתאריך הפינוי. שלב שני: הובלה מהמחסן לדירה החדשה כשמוכנה. שמרו רשימת פריטים דחופים בצד (מסמכים, ציוד יום-יומי) שלא נכנס למחסן, כדי שלא תצטרכו לפתוח קרטונים באמצע.</p><h3>מה צריך לברר לגבי ביטוח התכולה?</h3><p>שאלו מה מכוסה בשלב ההובלה ובשלב האחסון, האם יש הגבלות לפריטים שבירים או יקרים, וכיצד מדווחים על נזק אם מתרחש. הבהרה מראש עוזרת לקבל החלטה בראש שקט.</p>`,
  ),
  widgetText(
    `<p>מעבר בלי דירה מוכנה ביום היעד הוא אתגר ניהולי — לא סוף העולם. עם מיון, תכנון ושילוב מושכל של <strong>הובלה ואחסון תכולה בירושלים</strong>, אפשר לשמור על שליטה בתכולה ולהיכנס לדירה החדשה בקצב שמתאים לכם.</p><p>רוצים לבדוק מה מתאים למצב שלכם — הובלה בלבד, אחסון בלבד או שילוב? <a href="/הצעת-מחיר/">השאירו פרטים לקבלת הצעת מחיר</a> או התקשרו ל־<a href="tel:0525005573">052-500-55-73</a> לשיחת ייעוץ קצרה.</p>`,
  ),
].join("\n");

const contentHtml = `\t\t<div data-elementor-type="wp-post" data-elementor-id="55001" class="elementor elementor-55001" data-elementor-post-type="post">
\t\t\t<section class="elementor-section elementor-top-section elementor-section-boxed">
\t\t\t\t<div class="elementor-container elementor-column-gap-default">
\t\t\t\t\t<div class="elementor-column elementor-col-100">
\t\t\t\t\t\t<div class="elementor-widget-wrap elementor-element-populated">
${body.split("\n").join("\n\t\t\t\t\t\t\t")}
\t\t\t\t\t\t</div>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</section>
\t\t</div>`;

const post = {
  id: 55001,
  type: "post",
  slug,
  path: pathSlug,
  title,
  contentHtml,
  excerptHtml:
    "<p>הדירה החדשה עדיין לא מוכנה ביום הפינוי? מדריך לתכנון הובלה ואחסון תכולה בירושלים — מיון, אריזה, שני שלבי הובלה ובדיקות לפני אחסון, בלי הבטחות מיותרות.</p>\n",
  featuredMediaId: 3983,
  parent: 0,
  categories: [39, 33],
  tags: [],
  author: 3,
  date: now,
  modified: now,
  seo: {
    title: `${title} | אקספרס הובלות בירושלים`,
    description:
      "פער בין פינוי לכניסה לדירה בירושלים? איך לשלב הובלת דירה עם אחסון זמני — תכנון, אריזה, בדיקות לפני מחסן ושאלות נפוצות. מדריך שימושי למעבר.",
    canonical,
    robots: {
      index: "index",
      follow: "follow",
      "max-snippet": "max-snippet:-1",
      "max-image-preview": "max-image-preview:large",
      "max-video-preview": "max-video-preview:-1",
    },
    ogTitle: title,
    ogDescription:
      "פער בין פינוי לכניסה לדירה בירושלים? איך לשלב הובלת דירה עם אחסון זמני — תכנון, אריזה ובדיקות לפני מחסן.",
    ogImage: "https://express-hovalot.co.il/wp-content/uploads/2025/06/2.webp",
    twitterCard: "summary_large_image",
    schema: null,
  },
};

const posts = JSON.parse(fs.readFileSync(POSTS, "utf8"));
if (posts.some((p) => p.slug === slug)) {
  console.error("Post already exists:", slug);
  process.exit(1);
}
posts.push(post);
fs.writeFileSync(POSTS, JSON.stringify(posts, null, 2) + "\n");

const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
const entry = {
  oldUrl: canonical,
  requiredNewPath: pathSlug,
  expectedStatus: 200,
  expectedIndexability: "indexable",
  expectedCanonical: canonical,
  contentType: "post",
  redirectRequirement: "Preserve trailing-slash 301 if non-canonical variant requested",
  notes: "New weekly SEO article — sitemap member",
};
if (!contract.items.some((i) => i.requiredNewPath === pathSlug)) {
  contract.items.push(entry);
  contract.preserveExact = (contract.preserveExact || 0) + 1;
  fs.writeFileSync(CONTRACT, JSON.stringify(contract, null, 2) + "\n");
}

console.log("Added post", slug);
