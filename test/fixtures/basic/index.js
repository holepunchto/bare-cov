const setupCoverage = require('bare-cov')

setupCoverage().then(() => {
  require('./test1')
  require('./test2')
})
