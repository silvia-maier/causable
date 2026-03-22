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

- Pages are Liquid templates in `src/` with YAML frontmatter
- `bin/lib/compile.js` compiles them to HTML in `dist/`
- TailwindCSS builds `src/styles.css` into `dist/assets/styles.css`
- Static assets (`assets/`, favicons, etc.) are copied to `dist/`
- `sitemap.xml` is auto-generated from compiled pages using git dates and frontmatter `priority`
- Set `isDraft: true` in frontmatter to exclude a page from the build

## Deployment

Pushing to `master` triggers a GitHub Actions workflow that builds and deploys to GitHub Pages automatically. No need to commit generated files.

## Frontmatter options

```yaml
---
title: "Page Title"
description: "Meta description"
priority: 0.8       # sitemap priority (default: 0.5)
isDraft: true       # exclude from build
---
```
