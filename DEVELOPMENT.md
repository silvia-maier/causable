# Causable

## Development

Start development (builds, watches for changes, auto-reloads browser):
```bash
npm run dev
```

Build only (no server):
```bash
npm run build
```

## How it works

- Pages are Liquid templates with YAML frontmatter, organized by language:
  - `src/de/` — German pages, the primary language, output to the site **root** (`src/de/strategie.liquid` → `dist/strategie.html`)
  - `src/en/` — English pages, output under **`/en/`** (`src/en/strategy.liquid` → `dist/en/strategy.html`)
- Shared partials live in `src/templates/` (`_head`, `_header`, `_footer`) and `src/includes/` (forms); they adapt to the page's language via `page.lang`
- `bin/lib/compile.js` compiles everything to `dist/`
- TailwindCSS builds `src/styles.css` into `dist/assets/styles.css`
- Static assets (`assets/`, favicons, etc.) are copied to `dist/`
- `sitemap.xml` is auto-generated from compiled pages using git dates and frontmatter `priority`, including `hreflang` alternates
- Set `isDraft: true` in frontmatter to exclude a page from the build

## Internationalization (i18n)

The site is bilingual: German at the root, English under `/en/`.

- **Pairing translations** — give a page and its translation the same `key` in frontmatter (e.g. German `ueber-uns.liquid` and English `about.liquid` both use `key: about`). The build groups pages by `key` to generate, automatically:
  - `hreflang` alternate + canonical tags in `<head>`
  - the DE/EN language switcher in the header
  - sitemap alternates
- A page without a counterpart in the other language simply shows no switcher and no alternates — so you can translate **incrementally**, one page at a time.
- **Redirect stubs** — old pre-i18n URLs (`/strategy.html`, etc.) are auto-emitted as meta-refresh + canonical stubs pointing to their new `/en/` home, preserving inbound links. A real German page at the same root path overrides its stub.
- **Slugs are localized** — German filenames use German slugs (`strategie.liquid`, `ueber-uns.liquid`); where a word is identical in both languages the slug is kept (`sparring`, `training`, `interim`).
- **Links and assets** — internal links are language-specific (German pages link to `/strategie.html`, English to `/en/strategy.html`). Always reference assets with a leading slash (`/assets/...`) so they resolve from any depth, including `/en/`.

## Deployment

Pushing to `master` triggers a GitHub Actions workflow that builds and deploys to GitHub Pages automatically. No need to commit generated files.

## Frontmatter options

```yaml
---
title: "Page Title"
description: "Meta description"
lang: de            # "de" (root) or "en" (/en/); matches the src/ subfolder
key: about          # shared id linking a page to its translation in the other language
priority: 0.8       # sitemap priority (default: 0.5)
isDraft: true       # exclude from build
---
```
