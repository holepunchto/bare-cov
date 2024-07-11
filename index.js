const { Session } = require('node:inspector')
const path = require('path')
const Module = require('module')
const { promisify } = require('util')
const Transformer = require('./lib/transformer')

async function main () {
  const session = new Session()
  session.connect()

  const sessionPost = promisify(session.post).bind(session)

  await sessionPost('Profiler.enable')
  await sessionPost('Profiler.startPreciseCoverage', { callCount: true, detailed: true })

  if (process.argv.length <= 1) {
    console.error('Script path not specified')
    process.exit(0)
  }

  const script = path.resolve(process.argv[2])
  Module.runMain(script)

  process.once('beforeExit', async () => {
    const v8Report = await sessionPost('Profiler.takePreciseCoverage')

    const transformer = new Transformer()
    const coverageMap = await transformer.transformToCoverageMap([v8Report])
    transformer.report(coverageMap)

    await sessionPost('Profiler.stopPreciseCoverage', {})

    session.disconnect()
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
