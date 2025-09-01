const setupCoverage = require('bare-cov')
const process = require('process')
const path = require('path')

setupCoverage().then(() => {
  const dst = path.join(__dirname, 'childdir')
  process.chdir(dst)
  require('./test1')
})
