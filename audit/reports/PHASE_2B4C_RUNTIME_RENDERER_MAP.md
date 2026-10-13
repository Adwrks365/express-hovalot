# Phase 2B.4C — Runtime Renderer Map

Generated: 2026-10-07T13:02:19.772Z
Base URL: http://localhost:3010

| URL | Expected | Actual Renderer | Raw Fallback | Blocks | Grids | ImageText | Final Conv | Orphan Forms | Status |
|-----|----------|-----------------|--------------|--------|-------|-----------|------------|--------------|--------|
| /הובלת-דירה-בירושלים/ | StructuredPageRenderer | StructuredPageRenderer | false | 8 | 0 | 0 | 1 | 0 | PASS |
| /הובלות-משרדים-בירושלים/ | ArchetypePageRenderer | ArchetypePageRenderer | false | 1 | 0 | 0 | 1 | 0 | FAIL (visual) |
| /חברת-אריזה-והובלה-בירושלים/ | ArchetypePageRenderer | ArchetypePageRenderer | false | 1 | 0 | 0 | 1 | 0 | FAIL (visual) |
| /אחסון-תכולה-לטווח-קצר/ | StructuredPageRenderer | StructuredPageRenderer | false | 6 | 0 | 0 | 1 | 0 | PASS |
| /אחסון-משטחים/ | StructuredPageRenderer | StructuredPageRenderer | false | 6 | 0 | 0 | 1 | 0 | PASS |
| /הובלות-באזור-ירושלים/ | ArchetypePageRenderer | ArchetypePageRenderer | true | 0 | 0 | 0 | 1 | 0 | FAIL |
| /הובלות-בגבעת-זאב/ | ArchetypePageRenderer | ArchetypePageRenderer | true | 0 | 0 | 0 | 1 | 0 | FAIL |
| /הובלות-במבשרת-ציון/ | ArchetypePageRenderer | ArchetypePageRenderer | true | 0 | 0 | 0 | 1 | 0 | FAIL |
| /הובלות-בבית-שמש/ | ArchetypePageRenderer | ArchetypePageRenderer | true | 0 | 0 | 0 | 1 | 0 | FAIL |
| /הצעת-מחיר/ | StructuredPageRenderer | StructuredPageRenderer | false | 2 | 0 | 0 | 0 | 0 | PASS |
| /about-us/ | StructuredPageRenderer | StructuredPageRenderer | false | 7 | 0 | 0 | 0 | 2 | PASS |
| /צרו-קשר/ | StructuredPageRenderer | StructuredPageRenderer | false | 3 | 0 | 0 | 0 | 1 | PASS |

## Section types

- **/הובלת-דירה-בירושלים/**: (none)
- **/הובלות-משרדים-בירושלים/**: faq
- **/חברת-אריזה-והובלה-בירושלים/**: faq
- **/אחסון-תכולה-לטווח-קצר/**: (none)
- **/אחסון-משטחים/**: (none)
- **/הובלות-באזור-ירושלים/**: (none)
- **/הובלות-בגבעת-זאב/**: (none)
- **/הובלות-במבשרת-ציון/**: (none)
- **/הובלות-בבית-שמש/**: (none)
- **/הצעת-מחיר/**: (none)
- **/about-us/**: (none)
- **/צרו-קשר/**: (none)

## Summary

- **Renderer mount:** ArchetypePageRenderer active on all non-curated commercial URLs (0 WordPressContent fallback).
- **Semantic composition:** FAIL on 4/4 area pages (0 blocks, rawFallback=true) and 2/2 ArchetypePageRenderer service samples (FAQ-only).
- **Visual delta vs 2B.4B:** No improvement on byte-compared pages; see `PHASE_2B4C_BEFORE_AFTER.md`.