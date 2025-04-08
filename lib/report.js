const path = require('path')

// TODO: truncate long uncovered lines and long filenames (maybe base this on the width of the terminal?)
// TODO: colorize output if available

const PERCENT_WIDTH = 9
const DIR_INDENT = 1
const FILE_INDENT = 2

function toPercent (covered, total) {
  if (total === 0 || covered === total) return '100'
  if (covered === 0) return '0'
  return (covered / total * 100).toFixed(2)
}

function ntimes (n, str) {
  return Array(n).fill(str).join('')
}

function pad (str, width, right) {
  if (str.length >= width) return str
  const fill = ntimes(width - str.length, ' ')
  return right ? str + fill : fill + str
}

function rowSeparator (nameWidth, uncoveredWidth) {
  const name = ntimes(nameWidth, '-')
  const uncovered = ntimes(uncoveredWidth, '-')
  const percent = ntimes(PERCENT_WIDTH, '-')
  const branch = ntimes(PERCENT_WIDTH + 1, '-')
  return [name, percent, branch, percent, percent, uncovered].join('|')
}

function printHeader (nameWidth, uncoveredWidth) {
  const name = pad('File', nameWidth, true)
  const unc = pad('Uncovered Line #s', uncoveredWidth, true)

  console.log(`${name}| % Stmts | % Branch | % Funcs | % Lines | ${unc}`)
}

function printRow (fileSummary, fileName, nameWidth, uncoveredWidth) {
  const statements = toPercent(fileSummary.covered.statements, fileSummary.total.statements)
  const branches = toPercent(fileSummary.covered.branches, fileSummary.total.branches)
  const functions = toPercent(fileSummary.covered.functions, fileSummary.total.functions)
  const lines = toPercent(fileSummary.covered.lines, fileSummary.total.lines)

  const uncoveredLines = fileSummary?.uncovered?.normalizedLines
    ? fileSummary.uncovered.normalizedLines
    : ' '

  console.log([
    pad(` ${fileName} `, nameWidth, true),
    pad(` ${statements} `, PERCENT_WIDTH),
    pad(` ${branches} `, PERCENT_WIDTH + 1),
    pad(` ${functions} `, PERCENT_WIDTH),
    pad(` ${lines} `, PERCENT_WIDTH),
    pad(` ${uncoveredLines} `, uncoveredWidth)
  ].join('|'))
}

function deriveWidths (groupedSummaries) {
  let nameWidth = 0
  let uncoveredWidth = 0

  for (const [dirName, dirSummary] of Object.entries(groupedSummaries)) {
    if (dirName.length + DIR_INDENT > nameWidth) nameWidth = dirName.length + DIR_INDENT

    for (const [fileName, fileSummary] of Object.entries(dirSummary.files)) {
      const normalizedLines = fileSummary.uncovered?.normalizedLines
      if (fileName.length + FILE_INDENT > nameWidth) nameWidth = fileName.length + FILE_INDENT
      if (normalizedLines && normalizedLines.length > uncoveredWidth) uncoveredWidth = normalizedLines.length
    }
  }

  // Add left/right space padding
  nameWidth += 2
  uncoveredWidth += 2

  return { nameWidth, uncoveredWidth }
}

function normalizeUncoveredLines (uncoveredLines) {
  if (!uncoveredLines || uncoveredLines.length === 0) return ''

  const lines = uncoveredLines.map(line => Number(line)).sort((a, b) => a - b)
  const ranges = []
  let start = lines[0]
  let end = start

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === end + 1) {
      end = lines[i]
      continue
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`)
    start = lines[i]
    end = start
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`)

  return ranges.join(',')
}

function addCoverages (a, b) {
  a.covered.statements += b.covered.statements
  a.covered.branches += b.covered.branches
  a.covered.functions += b.covered.functions
  a.covered.lines += b.covered.lines

  a.total.statements += b.total.statements
  a.total.branches += b.total.branches
  a.total.functions += b.total.functions
  a.total.lines += b.total.lines
}

function groupByDirectory (fileSummaries) {
  const directories = {}
  for (const summary of Object.values(fileSummaries)) {
    const directory = path.dirname(summary.relativePath)
    const file = path.basename(summary.relativePath)
    if (!directories[directory]) {
      directories[directory] = {
        files: {},
        coverage: {
          total: { statements: 0, branches: 0, functions: 0, lines: 0 },
          covered: { statements: 0, branches: 0, functions: 0, lines: 0 }
        }
      }
    }

    directories[directory].files[file] = summary

    addCoverages(directories[directory].coverage, summary)
  }

  return directories
}

function printBody (grouped, nameWidth, uncoveredWidth) {
  for (const [dirName, dirSummary] of Object.entries(grouped)) {
    printRow(dirSummary.coverage, `${ntimes(DIR_INDENT, ' ')}${dirName}`, nameWidth, uncoveredWidth)
    for (const [fileName, fileSummary] of Object.entries(dirSummary.files)) {
      printRow(fileSummary, `${ntimes(FILE_INDENT, ' ')}${fileName}`, nameWidth, uncoveredWidth)
    }
  }
}

module.exports = function reportCoverage ({ summary, fileSummaries }, dir = process.cwd()) {
  Object.entries(fileSummaries).forEach(([filePath, fileSummary]) => {
    fileSummary.uncovered.normalizedLines = normalizeUncoveredLines(fileSummary.uncovered.lines)
    fileSummary.relativePath = path.relative(dir, filePath).replace(/^\.\//g, '')
  })

  const grouped = groupByDirectory(fileSummaries)

  const { nameWidth, uncoveredWidth } = deriveWidths(grouped)

  const separator = rowSeparator(nameWidth, uncoveredWidth)
  const printSeparator = () => console.log(separator)

  printSeparator()
  printHeader(nameWidth, uncoveredWidth)
  printSeparator()

  printRow(summary, 'All files', nameWidth, uncoveredWidth)
  printBody(grouped, nameWidth, uncoveredWidth)

  printSeparator()
}
