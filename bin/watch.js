const chokidar = require('chokidar')
const {compile, rootFolder} = require('./lib/compile')

// Watch on all Liquid templates
const watcher = chokidar.watch(`${rootFolder}/**/*.liquid`)

watcher.on('change', (path, stats) => {
  console.log(`File ${path} was changed`)
  compile()
})

watcher.on('add', (path, stats) => {
  console.log(`File ${path} was added`)
  compile()
})
