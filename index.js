#!/usr/bin/env node

const { spawn } = require('child_process')
const { command } = require('paparam')
const path = require('path')
const fs = require('fs')
const Transformer = require('./lib/transformer')
const definition = require('./lib/definition')

async function main (args) {
  if (args.positionals.length < 1) {
    console.error('Script path not specified')
    process.exit(0)
  }

  const tmpDir = path.resolve(args.flags.tempDir ?? './coverage/tmp')

  if (fs.existsSync(tmpDir)) {
    fs.rmdirSync(tmpDir, { recursive: true })
  }

  const child = spawn(args.positionals[0], args.rest, {
    env: { ...process.env, NODE_V8_COVERAGE: tmpDir },
    stdio: 'inherit'
  })

  await new Promise((resolve, reject) => {
    child.on('exit', (exitCode) => {
      if (exitCode !== 0) process.exit(exitCode)
      else resolve()
    })
    child.on('error', reject)
  })

  const reports = fs.readdirSync(tmpDir).map(file => path.join(tmpDir, file))
    .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))

  const transformer = new Transformer({
    includeRelative: args.flags.includeRelative,
    exclude: args.flags.exclude,
    reportsDirectory: args.flags.reportsDir,
    watermarks: args.flags.watermarks,
    reporters: args.flags.reporter?.split(','),
    reporterOptions: args.flags.reporterOptions,
    skipFull: args.flags.skipFull
  })
  const coverageMap = await transformer.transformToCoverageMap(reports)
  transformer.report(coverageMap)
}

command('run', ...definition, main).parse(process.argv.slice(2))
