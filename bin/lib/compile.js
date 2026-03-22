const fs = require('fs-extra')
const {Liquid} = require('liquidjs')
const grayMatter = require('gray-matter')
const {execSync} = require('child_process')

const assetVersion = 5
const rootFolder = `${process.cwd()}/src`
const distFolder = `${process.cwd()}/dist`
const baseUrl = 'https://causable.ch'

// Liquid Engine
// -------------
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

  const files = await fs.readdir(rootFolder)
  const liquidFiles = files.filter((file) => file.endsWith('.liquid'))

  compiledPages = []

  for (const file of liquidFiles) {
    await renderTemplate(file.split('.')[0], {render}) // eslint-disable-line no-await-in-loop
  }

  await generateSitemap()
}

async function renderTemplate(fileName, globalData) {
  const template = await fs.readFile(`src/${fileName}.liquid`)
  const {content, data} = grayMatter(template)
  const frontMatter = data

  if (frontMatter.isDraft) {
    return
  }

  const output = await engine.parseAndRender(content, {...globalData, page: frontMatter})

  compiledPages.push({
    fileName,
    priority: frontMatter.priority ?? 0.5
  })

  return fs.writeFile(`${distFolder}/${fileName}.html`, output)
}

function getLastModified(fileName) {
  try {
    const date = execSync(
      `git log -1 --format="%ai" -- src/${fileName}.liquid`,
      {encoding: 'utf-8'}
    ).trim()
    return date.split(' ')[0]
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
    if (await fs.pathExists(src)) {
      await fs.copy(src, `${distFolder}/${file}`)
    }
  }
}

async function generateSitemap() {
  const urls = compiledPages
    .sort((a, b) => b.priority - a.priority)
    .map(({fileName, priority}) => {
      const lastmod = getLastModified(fileName)
      return `  <url>
    <loc>${baseUrl}/${fileName}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
