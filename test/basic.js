const { spawn } = require('child_process')
const process = require('process')
const path = require('path')
const test = require('brittle')
const fs = require('fs')

test('basic', async (t) => {
  const proc = spawn(process.execPath, ['index.js'], { stdio: 'pipe', cwd: path.join(__dirname, 'fixtures/basic') })

  let output = ''
  proc.stdout.on('data', (data) => { output += data.toString() })

  await new Promise((resolve) => { proc.on('exit', () => { resolve() }) })

  const outputLines = output.trim().split(/\r?\n/)
  t.alike(outputLines, [
    '------------|---------|----------|---------|---------|-------------------',
    'File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s ',
    '------------|---------|----------|---------|---------|-------------------',
    ' All files  |   86.44 |    92.86 |     100 |   86.44 |                   ',
    '  basic     |   86.44 |    92.86 |     100 |   86.44 |                   ',
    '   index.js |     100 |      100 |     100 |     100 |                   ',
    '   test1.js |   68.00 |    75.00 |     100 |   68.00 | 11-18             ',
    '   test2.js |     100 |      100 |     100 |     100 |                   ',
    '------------|---------|----------|---------|---------|-------------------'
  ])

  t.is(proc.exitCode, 0, 'process should exit with code 0')
})

test('basic with duplicate', async (t) => {
  const proc = spawn(process.execPath, ['index.js'], { stdio: 'pipe', cwd: path.join(__dirname, 'fixtures/duplicated') })

  let output = ''
  proc.stdout.on('data', (data) => { output += data.toString() })

  await new Promise((resolve) => { proc.on('exit', () => { resolve() }) })

  const v8Coverage = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'duplicated', 'coverage', 'v8-coverage.json'), 'utf8'))
  const test1Coverages = v8Coverage.result.filter(result => result.url.endsWith('test1.js'))
  t.is(test1Coverages.length, 3, 'should have three test1.js coverage results')

  const outputLines = output.trim().split(/\r?\n/)
  t.alike(outputLines, [
    '-------------|---------|----------|---------|---------|-------------------',
    'File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s ',
    '-------------|---------|----------|---------|---------|-------------------',
    ' All files   |   88.89 |    77.78 |     100 |   88.89 |                   ',
    '  duplicated |   88.89 |    77.78 |     100 |   88.89 |                   ',
    '   index.js  |     100 |      100 |     100 |     100 |                   ',
    '   test1.js  |   82.61 |    75.00 |     100 |   82.61 | 8-9,17-18         ',
    '-------------|---------|----------|---------|---------|-------------------'
  ])

  t.is(proc.exitCode, 0, 'process should exit with code 0')
})
