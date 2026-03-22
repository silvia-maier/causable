const chokidar = require('chokidar')
const {compile, rootFolder} = require('./lib/compile')

console.log('Watching for changes...')

const watcher = chokidar.watch(`${rootFolder}/**/*.liquid`, {
  ignoreInitial: true
})

watcher.on('change', (path) => {
  console.log(`File ${path} was changed`)
  compile()
})

watcher.on('add', (path) => {
  console.log(`File ${path} was added`)
  compile()
})
