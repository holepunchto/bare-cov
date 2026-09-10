const setupCoverage = require('bare-cov')

setupCoverage({ skipRawDump: true, reporters: ['json'] }).then(() => {
  require('./test1')
})
