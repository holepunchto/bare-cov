const test = require('brittle')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const process = require('process')
const os = require('os')

const CMD_PATH = path.join(__dirname, '..', 'cmd.js')

test('command should exit with error if no command provided', async (t) => {
  const proc = spawn(process.execPath, [CMD_PATH], { stdio: ['ignore', 'pipe', 'pipe'] })
  let stderr = ''
  proc.stderr.on('data', d => { stderr += d.toString() })

  await new Promise(resolve => proc.on('exit', resolve))

  t.ok(stderr.includes('No command provided'))
  t.is(proc.exitCode, 1)
})

test('command should exit with error if coverage dir does not exist', async (t) => {
  const fakeCmd = process.execPath
  const fakeDir = path.join(__dirname, 'not-exist-dir')

  const proc = spawn(process.execPath, [CMD_PATH, '--cov-dir', fakeDir, fakeCmd, '-v'], { stdio: ['ignore', 'pipe', 'pipe'] })

  let stderr = ''
  proc.stderr.on('data', d => { stderr += d.toString() })

  await new Promise(resolve => proc.on('exit', resolve))

  t.ok(stderr.includes('Coverage directory does not exist'))
  t.is(proc.exitCode, 1)
})

test('command should run and process coverage', async (t) => {
  const covDir = path.join(__dirname, 'fixtures', 'cmd-coverage')
  const covFile = path.join(covDir, 'coverage-final.json')
  t.teardown(() => { fs.rmSync(covFile, { force: true }) })

  const proc = spawn(process.execPath, [CMD_PATH, '--no-clean', '--cov-dir', covDir, process.execPath, '-v'], { stdio: ['ignore', 'pipe', 'pipe'] })

  let stderr = ''
  let stdout = ''
  proc.stderr.on('data', d => { stderr += d.toString() })
  proc.stdout.on('data', d => { stdout += d.toString() })

  await new Promise(resolve => proc.on('exit', resolve))

  t.ok(fs.existsSync(covFile), 'coverage-final.json should exist')
  t.is(proc.exitCode, 0)
  t.is(stderr, '', 'stderr should be empty')
  t.ok(stdout.includes('File'), 'stdout should contain coverage report header')
})

test('command should exit with error if child process fails', async (t) => {
  const proc = spawn(process.execPath, [CMD_PATH, process.execPath, '-e', '(global.Bare || process).exit(42)'], { stdio: ['ignore', 'pipe', 'pipe'] })

  let stderr = ''
  proc.stderr.on('data', d => { stderr += d.toString() })

  await new Promise(resolve => proc.on('exit', resolve))

  t.ok(stderr.includes('Command exited with code: 42'))
  t.is(proc.exitCode, 42)
})

test('command should clean coverage dir if --clean is passed', async (t) => {
  const covDir = path.join(os.tmpdir(), `bare-cov-cmd-clean-${Date.now()}`)
  fs.mkdirSync(covDir, { recursive: true })
  fs.writeFileSync(path.join(covDir, 'dummy.txt'), 'dummy')
  fs.writeFileSync(path.join(covDir, 'fake.json'), JSON.stringify({ result: [] }))

  t.teardown(() => {
    try { fs.rmSync(covDir, { recursive: true, force: true }) } catch {}
  })

  const proc = spawn(process.execPath, [CMD_PATH, '--cov-dir', covDir, '--no-clean', process.execPath, '-v'], { stdio: ['ignore', 'pipe', 'pipe'] })
  await new Promise(resolve => proc.on('exit', resolve))

  t.ok(fs.existsSync(covDir), 'dir should still exist with --no-clean')

  fs.writeFileSync(path.join(covDir, 'dummy.txt'), 'dummy')
  fs.writeFileSync(path.join(covDir, 'fake.json'), JSON.stringify({ result: [] }))

  const proc2 = spawn(process.execPath, [CMD_PATH, '--cov-dir', covDir, '--clean', process.execPath, '-v'], { stdio: ['ignore', 'pipe', 'pipe'] })
  await new Promise(resolve => proc2.on('exit', resolve))

  t.not(fs.existsSync(path.join(covDir, 'dummy.txt')), 'dummy.txt should be removed')
})
