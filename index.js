'use strict'

const { isBare } = require('which-runtime')
const { Session } = require(isBare ? 'bare-inspector' : 'inspector')
const fs = require(isBare ? 'bare-fs' : 'fs')
const path = require(isBare ? 'bare-path' : 'path')
const Transformer = require('./lib/transformer')

module.exports = async function setupCoverage (opts = {}) {
  const session = new Session()
  session.connect()

  const sessionPost = (...args) => new Promise((resolve, reject) =>
    session.post(...args, (err, result) => err ? reject(err) : resolve(result))
  )

  await sessionPost('Profiler.enable')
  await sessionPost('Profiler.startPreciseCoverage', { callCount: true, detailed: true });

  (isBare ? global.Bare : process).once('beforeExit', async () => {
    const dir = opts.dir ?? 'coverage'

    const v8Report = await sessionPost('Profiler.takePreciseCoverage')
    isBare ? session.destroy() : session.disconnect()

    if (opts.skipRawDump !== true) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'v8-coverage.json'), JSON.stringify(v8Report))
    }

    const transformer = new Transformer(opts)
    const coverageMap = await transformer.transformToCoverageMap(v8Report)
    fs.writeFileSync(path.join(dir, 'coverage-final.json'), JSON.stringify(coverageMap))
    transformer.report(coverageMap)
  })
}
