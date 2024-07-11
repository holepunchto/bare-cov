const { Session } = require('node:inspector')
const { promisify } = require('util')

async function runWithCoverage (method, args = []) {
  const session = new Session()
  session.connect()

  const sessionPost = promisify(session.post).bind(session)

  await sessionPost('Profiler.enable')
  await sessionPost('Profiler.startPreciseCoverage', { callCount: true, detailed: true })

  await method(...args)

  const v8Report = await sessionPost('Profiler.takePreciseCoverage')
  await sessionPost('Profiler.stopPreciseCoverage', {})
  session.disconnect()

  return v8Report
}

module.exports = runWithCoverage
