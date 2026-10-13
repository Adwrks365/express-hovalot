# FTP Read-Only Server Inventory

WordPress root: `/` (confirmed)

## Core Structure

| Path | Present |
|------|---------|
| wp-admin/ | Yes |
| wp-content/ | Yes |
| wp-includes/ | Yes |
| wp-config.php | Yes (not read — secrets not exposed) |
| .htaccess | Yes — redirect rewrite rules present (count recorded locally, content not stored) |

## Themes

| Directory | Theme Name | Parent |
|-----------|------------|--------|
| everest | Everest | — (active per REST) |
| astra | Astra | — (installed, inactive) |

No child theme detected by naming convention.

## Plugin Directories (FTP)

`elementor`, `elementor-pro`, `wordpress-seo`, `duracelltomi-google-tag-manager`, `wp-reviews-plugin-for-google`, `insert-headers-and-footers`, `google-site-kit`, `ezcache`, `image-optimization`, `insytix-site-analytics`, `pojo-accessibility`, `manage`, `angie`, `classic-editor`, `duplicate-page`, `aryo-activity-log`, `wordpress-starter`, `wp-asset-clean-up`, `header-footer`

**Note:** FTP directory presence ≠ active status. Active status confirmed via WordPress REST where available.
