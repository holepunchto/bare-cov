'use strict'

const { Session } = require('node:inspector')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const Transformer = require('./lib/transformer')

module.exports = async function setupCoverage (opts = {}) {
  const session = new Session()
  session.connect()

  const sessionPost = promisify(session.post).bind(session)

  await sessionPost('Profiler.enable')
  await sessionPost('Profiler.startPreciseCoverage', { callCount: true, detailed: true })

  process.once('beforeExit', async () => {
    const v8Report = await sessionPost('Profiler.takePreciseCoverage')
    session.disconnect()

    if (opts.dumpRawCoverage ?? true) {
      const reportsDirectory = opts.reportsDirectory ?? 'coverage'
      if (!fs.existsSync(reportsDirectory)) fs.mkdirSync(reportsDirectory, { recursive: true })
      fs.writeFileSync(path.join(reportsDirectory, `v8-coverage-${process.pid}-${new Date().getTime()}.json`), JSON.stringify(v8Report))
    }

    const transformer = new Transformer(opts)
    const coverageMap = await transformer.transformToCoverageMap(v8Report)
    transformer.report(coverageMap)
  })
}
