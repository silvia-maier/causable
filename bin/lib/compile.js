const fs = require('fs-extra')
const {Liquid} = require('liquidjs')
const grayMatter = require('gray-matter')

const assetVersion = 5
const rootFolder = `${process.cwd()}/src`

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

module.exports = {
  rootFolder,

  async compile() {
    // Get all .liquid files from the src folder
    // Note: fs.readdir returns multiple times when files are being written
    // -> to be investigated...
    const files = await fs.readdir(rootFolder)
    const liquidFiles = files.filter((file) => file.endsWith('.liquid'))

    // Render each .liquid file
    for (const file of liquidFiles) {
      await renderTemplate(file.split('.')[0], {render}) // eslint-disable-line no-await-in-loop
    }
  }
}

async function renderTemplate(fileName, globalData) {
  const template = await fs.readFile(`src/${fileName}.liquid`)
  const {content, data} = grayMatter(template)
  const frontMatter = data

  if (frontMatter.isDraft) {
    // If the file exists delete it
    return fs.remove(`${fileName}.html`)
  }

  const output = await engine.parseAndRender(content, {...globalData, page: frontMatter})

  return fs.writeFile(`${fileName}.html`, output)
}
