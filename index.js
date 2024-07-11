#!/usr/bin/env node

const { spawn } = require('child_process')
const { command } = require('paparam')
const path = require('path')
const fs = require('fs')
const Transformer = require('./lib/transformer')
const definition = require('./lib/definition')

function parseOrThrow (value, error) {
  try {
    return JSON.parse(value)
  } catch (e) {
    throw new Error(error)
  }
}

async function main (args) {
  if (args.positionals.length < 1) {
    console.error('Script path not specified')
    process.exit(0)
  }

  const tmpDir = path.resolve(args.flags.tempDir ?? './coverage/tmp')

  if (args.flags.skipCleanup === false && fs.existsSync(tmpDir)) {
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
    .map(file => parseOrThrow(fs.readFileSync(file, 'utf8'), `Failed to parse coverage report at ${file}`))
    .filter(v8Report => Array.isArray(v8Report?.result))

  const transformer = new Transformer({
    includeRelative: args.flags.includeRelative,
    reportsDirectory: args.flags.reportsDir,
    watermarks: args.flags.watermarks,
    reporters: args.flags.reporter?.split(','),
    reporterOptions: args.flags.reporterOptions,
    skipFull: args.flags.skipFull,
    exclude: args.flags.exclude && parseOrThrow(args.flags.exclude, 'Exclude option must be valid JSON'),
    include: args.flags.include && parseOrThrow(args.flags.include, 'Include option must be valid JSON'),
    extension: args.flags.extension && parseOrThrow(args.flags.extension, 'Extension must be valid JSON'),
    allowExternal: args.flags.allowExternal,
    includeNodeModules: args.flags.includeNodeModules
  })
  const coverageMap = await transformer.transformToCoverageMap(reports)
  transformer.report(coverageMap)
}

command('run', ...definition, main).parse(process.argv.slice(2))
