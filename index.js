const { Session } = require('node:inspector')
const { promisify } = require('util')
const Transformer = require('./lib/transformer')

module.exports = async function setupCoverage (opts) {
  const session = new Session()
  session.connect()

  const sessionPost = promisify(session.post).bind(session)

  await sessionPost('Profiler.enable')
  await sessionPost('Profiler.startPreciseCoverage', { callCount: true, detailed: true })

  process.once('beforeExit', async () => {
    const v8Report = await sessionPost('Profiler.takePreciseCoverage')
    session.disconnect()

    const transformer = new Transformer({ reporters: ['json', 'text'], opts })
    const coverageMap = await transformer.transformToCoverageMap([v8Report])
    transformer.report(coverageMap)
  })
}
