const setupCoverage = require('bare-cov')
const fs = require('fs')
const { pathToFileURL } = require('url')

setupCoverage().then(async () => {
  const codePath = require.resolve('./test1.js')
  const code = fs.readFileSync(codePath, 'utf8')
  const url = pathToFileURL(codePath).href
  /* eslint-disable no-eval */
  eval(`${code} //# sourceURL=${url}`)
  eval(`${code.replace('12345', '"123456"')} //# sourceURL=${url}`)
  eval(`${code.replace('12345', '"1"')} //# sourceURL=${url}`)
})
