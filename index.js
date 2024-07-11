const { Session } = require('node:inspector')
const path = require('path')
const Module = require('module')
const { promisify } = require('util')
const { command } = require('paparam')
const Transformer = require('./lib/transformer')
const definition = require('./lib/definition')

async function main (args) {
  const session = new Session()
  session.connect()

  const sessionPost = promisify(session.post).bind(session)

  await sessionPost('Profiler.enable')
  await sessionPost('Profiler.startPreciseCoverage', { callCount: true, detailed: true })

  if (args.positionals.length < 1) {
    console.error('Script path not specified')
    process.exit(0)
  }

  const script = path.resolve(args.positionals[0])
  process.argv = [process.argv[0], script, ...args.rest]
  Module.runMain(script)

  process.once('beforeExit', async () => {
    const v8Report = await sessionPost('Profiler.takePreciseCoverage')

    const transformer = new Transformer({
      omitRelative: !args.flags.includeRelative,
      exclude: args.flags.exclude,
      reportsDirectory: args.flags.reportsDir,
      watermarks: args.flags.watermarks,
      reporters: args.flags.reporter?.split(','),
      reporterOptions: args.flags.reporterOptions,
      skipFull: args.flags.skipFull
    })
    const coverageMap = await transformer.transformToCoverageMap([v8Report])
    transformer.report(coverageMap)

    await sessionPost('Profiler.stopPreciseCoverage', {})

    session.disconnect()
  })
}

command('run', ...definition, main).parse(process.argv.slice(2))
