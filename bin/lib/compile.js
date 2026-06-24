const fs = require('fs-extra')
const path = require('path')
const {Liquid} = require('liquidjs')
const grayMatter = require('gray-matter')
const {execSync} = require('child_process')

const assetVersion = 5
const rootFolder = `${process.cwd()}/src`
const distFolder = `${process.cwd()}/dist`
const baseUrl = 'https://causable.ch'

// Locales
// -------
// German is the primary language and lives at the site root.
// English lives under /en/. Each entry maps a source subfolder (src/<dir>)
// to an output base path under dist/.
const locales = {
  de: {dir: 'de', base: ''},
  en: {dir: 'en', base: 'en'}
}
const defaultLang = 'de'

// Liquid Engine
// -------------
// `root` stays at src/ so includes like 'templates/_head.liquid' resolve
// regardless of which locale subfolder a page lives in.
const engine = new Liquid({
  root: rootFolder,
  extname: '.liquid'
})

// Global Render Data
// ------------------
const render = {
  assetVersion
}

// Track compiled pages for sitemap
let compiledPages = []

async function build() {
  await fs.emptyDir(distFolder)
  await copyStaticAssets()
  await compile()
}

async function compile() {
  await fs.ensureDir(distFolder)

  const pages = await collectPages()

  // Group translations by `key` so each page knows its counterparts.
  const byKey = {}
  for (const p of pages) {
    ;(byKey[p.key] ||= []).push(p)
  }

  compiledPages = []

  for (const p of pages) {
    if (p.frontMatter.isDraft) continue // eslint-disable-line no-continue

    const alternates = byKey[p.key]
      .filter((q) => !q.frontMatter.isDraft)
      .map((q) => ({lang: q.lang, url: pageUrl(q)}))

    await renderPage(p, alternates) // eslint-disable-line no-await-in-loop
  }

  await generateRedirectStubs(pages)
  await generateSitemap()
}

// Read every *.liquid page across all locale folders.
async function collectPages() {
  const pages = []

  for (const [lang, loc] of Object.entries(locales)) {
    const dir = `${rootFolder}/${loc.dir}`
    // eslint-disable-next-line no-await-in-loop, no-continue
    if (!(await fs.pathExists(dir))) continue

    // eslint-disable-next-line no-await-in-loop
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.liquid'))
    for (const file of files) {
      const slug = file.replace(/\.liquid$/, '')
      // eslint-disable-next-line no-await-in-loop
      const raw = await fs.readFile(`${dir}/${file}`, 'utf-8')
      const {content, data} = grayMatter(raw)
      pages.push({
        lang,
        loc,
        slug,
        file,
        source: `src/${loc.dir}/${file}`,
        content,
        frontMatter: data,
        key: data.key || slug
      })
    }
  }

  return pages
}

// Output path of a page relative to dist/ (no leading slash).
function pagePath(p) {
  return p.loc.base ? `${p.loc.base}/${p.slug}.html` : `${p.slug}.html`
}

// Absolute (site-relative) URL of a page.
function pageUrl(p) {
  return `/${pagePath(p)}`
}

async function renderPage(p, alternates) {
  const xDefault = alternates.find((a) => a.lang === defaultLang) || {url: pageUrl(p)}

  const output = await engine.parseAndRender(p.content, {
    render,
    baseUrl,
    lang: p.lang,
    alternates,
    xDefaultUrl: xDefault.url,
    page: {...p.frontMatter, lang: p.lang, slug: p.slug, url: pageUrl(p)}
  })

  const outPath = `${distFolder}/${pagePath(p)}`
  await fs.ensureDir(path.dirname(outPath))
  await fs.writeFile(outPath, output)

  compiledPages.push({
    path: pagePath(p),
    source: p.source,
    priority: p.frontMatter.priority ?? 0.5,
    alternates
  })
}

// Slugs that had a public root URL before German became the primary language
// (`/<slug>.html`). Each is redirected to its new English home under `/en/`.
// This is a fixed, historical artifact of the one-time i18n migration — new
// pages must NOT be added here. The same-word slugs (sparring, training,
// interim) and the home page are intentionally absent: a German page now owns
// those root URLs.
const legacyRootRedirects = [
  'strategy',
  'about',
  'cross-functional-leadership',
  'facilitation-tools',
  'leading-remote-teams',
  'self-leadership-essentials',
  'self-leadership-masterclass',
  'targeted-communication',
  'value-creation-journey'
]

// Emit a meta-refresh stub at each legacy root URL pointing to its new /en/
// home — unless a primary-language (root) page now occupies that URL, or the
// English target no longer exists.
async function generateRedirectStubs(pages) {
  const rootOccupied = new Set(
    pages
      .filter((p) => !p.frontMatter.isDraft && p.loc.base === '')
      .map((p) => pagePath(p))
  )
  const enPaths = new Set(
    pages
      .filter((p) => p.lang === 'en' && !p.frontMatter.isDraft)
      .map((p) => pagePath(p))
  )

  for (const slug of legacyRootRedirects) {
    const stubPath = `${slug}.html` // the old root URL
    const target = `/en/${slug}.html` // its new home
    // eslint-disable-next-line no-continue
    if (rootOccupied.has(stubPath) || !enPaths.has(`en/${slug}.html`)) continue

    const outPath = `${distFolder}/${stubPath}`
    // eslint-disable-next-line no-await-in-loop
    await fs.ensureDir(path.dirname(outPath))
    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(outPath, redirectHtml(target))
  }
}

function redirectHtml(target) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${baseUrl}${target}">
<title>Redirecting…</title>
</head>
<body>
<p>This page has moved to <a href="${target}">${baseUrl}${target}</a>.</p>
</body>
</html>
`
}

function getLastModified(source) {
  try {
    const date = execSync(
      `git log -1 --format="%ai" -- ${source}`,
      {encoding: 'utf-8'}
    ).trim()
    return date.split(' ')[0] || new Date().toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

async function copyStaticAssets() {
  const cwd = process.cwd()

  await fs.copy(`${cwd}/assets`, `${distFolder}/assets`)

  const staticFiles = [
    'CNAME',
    '.nojekyll',
    'robots.txt',
    'manifest.json',
    'favicon-128x128.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'apple-touch-icon-180x180.png'
  ]

  for (const file of staticFiles) {
    const src = `${cwd}/${file}`
    // eslint-disable-next-line no-await-in-loop
    if (await fs.pathExists(src)) {
      // eslint-disable-next-line no-await-in-loop
      await fs.copy(src, `${distFolder}/${file}`)
    }
  }
}

async function generateSitemap() {
  const urls = compiledPages
    .sort((a, b) => b.priority - a.priority)
    .map(({path: pagePathStr, priority, source, alternates}) => {
      const lastmod = getLastModified(source)
      const links = alternates
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${baseUrl}${alt.url}"/>`
        )
        .join('\n')
      return `  <url>
    <loc>${baseUrl}/${pagePathStr}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
${links}
  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`

  return fs.writeFile(`${distFolder}/sitemap.xml`, sitemap)
}

module.exports = {
  rootFolder,
  build,
  compile
}
