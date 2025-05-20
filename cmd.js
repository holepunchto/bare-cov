'use strict'

const fs = require('fs')
const path = require('path')
const Transformer = require('./lib/transformer')
const process = require('process')
const { command, flag, rest } = require('paparam')
const { spawn } = require('child_process')

async function processCoverage (opts) {
  const dir = opts.dir ?? 'coverage'
  let v8Report
  try {
    v8Report = JSON.parse(fs.readFileSync(path.join(dir, 'v8-coverage.json'), 'utf8'))
  } catch (error) {
    throw new Error('Failed to read v8-coverage.json: ' + error.message)
  }

  if (!fs.existsSync(dir)) throw new Error(`Coverage directory does not exist: ${dir}`)

  const transformer = new Transformer(opts)
  await transformer.add(v8Report)
  fs.writeFileSync(path.join(dir, 'coverage-final.json'), JSON.stringify(transformer.coverages))
  transformer.report()
}

async function run () {
  const cmd = command('bcov',
    flag('--cov-dir <dir>', 'Configure coverage output directory (default: ./coverage)'),
    rest('<command>', 'The command to run')
  ).parse(process.argv.slice(2))

  const covDir = cmd?.flags?.['cov-dir'] || './coverage'
  const commandArg = cmd?.rest?.[0]

  if (!commandArg) {
    console.error('No command provided')
    process.exit(1)
  }

  const args = cmd.rest.slice(1)
  const opts = { stdio: 'inherit', env: { ...process.env, BARE_V8_COVERAGE: covDir } }
  const child = spawn(commandArg, args, opts)
  child.on('error', (error) => {
    console.error(`Error executing command: ${error.message}`)
    process.exit(1)
  })

  child.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Command exited with code: ${code}`)
      process.exit(code)
    }

    try {
      await processCoverage({ dir: covDir })
    } catch (error) {
      console.error('Error processing coverage', error)
      process.exit(1)
    }
  })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
