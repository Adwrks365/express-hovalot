# Homepage Service Asset Parity — Phase 2A.10

**Source:** Elementor post-2701 image-box widgets (parsed via `scripts/map-services3.mjs`)

Each service uses **badge** (small shield) + **photo** (large image).

| SERVICE | PRODUCTION BADGE | WP ID | PRODUCTION PHOTO | WP ID | LOCAL BADGE | LOCAL PHOTO | DESTINATION URL | VISUAL MATCH |
|---------|------------------|-------|------------------|-------|-------------|-------------|-----------------|--------------|
| הובלת דירה בירושלים | hovalot.webp | 2748 | Small_1.webp | 2311 | `/media/2748-hovalot.webp` | `/media/2311-Small_1.webp` | `/הובלת-דירה-בירושלים` | **YES** |
| שירותי אריזה בירושלים | parcel.webp | 2747 | Small_2.webp | 2312 | `/media/2747-parcel.webp` | `/media/2312-Small_2.webp` | `/חברת-אריזה-והובלה-בירושלים` | **YES** |
| הובלת משטחים בירושלים | Asset-9@2x.png | 2759 | Small_3.webp | 2313 | `/media/2759-Asset-9_2x.png` | `/media/2313-Small_3.webp` | `/הובלת-משטחים-בירושלים` | **YES** |
| הובלת משרדים בירושלים | hovalot.webp | 2748 | services-4.webp | 2597 | `/media/2748-hovalot.webp` | `/media/2597-services-4.webp` | `/הובלות-משרדים-בירושלים` | **YES** |
| שירותי אחסנה בירושלים | parcel.webp | 2747 | storage-warehouse…webp | 2561 | `/media/2747-parcel.webp` | `/media/2561-storage-warehouse-storage-warehouse-1553550.webp` | `/אחסון-תכולה-בירושלים` | **YES** |
| הובלת מנוף בירושלים | Asset-9@2x.png | 2759 | 14.webp | 3995 | `/media/2759-Asset-9_2x.png` | `/media/3995-14.webp` | `/הובלות-מיוחדות-בירושלים` | **YES** |

## Previous local error (Phase 2A.9)

Single `image` field used badge-only assets (2748, 2747, 2759) as circular 68px thumbnails — **wrong composition and wrong primary photo**.

## Phase 2A.10 fix

- Badge overlaid on 4:3 photo area
- Large photography as primary visual
- All six badge + photo pairs match Elementor HTML
