const setupCoverage = require('bare-cov')
const fs = require('fs')

setupCoverage().then(async () => {
  const code = fs.readFileSync(`${__dirname}/test1.js`, 'utf8')
  eval(`${code} //# sourceURL=file://${__dirname}/test1.js`)
  eval(`${code.replace('12345', '"123456"')} //# sourceURL=file://${__dirname}/test1.js`)
  eval(`${code.replace('12345', '"1"')} //# sourceURL=file://${__dirname}/test1.js`)
})
