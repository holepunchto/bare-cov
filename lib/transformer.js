const { isAbsolute } = require('path')
const { fileURLToPath } = require('url')
const Exclude = require('test-exclude')
const libCoverage = require('istanbul-lib-coverage')
const defaultExclude = require('@istanbuljs/schema/default-exclude')
const libReport = require('istanbul-lib-report')
const v8ToIstanbul = require('v8-to-istanbul')
const reports = require('istanbul-reports')

class Transformer {
  constructor (opts = {}) {
    this.includeRelative = opts.includeRelative ?? false
    this.exclude = new Exclude(opts.exclude ?? defaultExclude)
    this.reportsDirectory = opts.reportsDirectory ?? './coverage'
    this.watermarks = opts.watermarks ?? {}
    this.reporters = opts.reporters ?? ['text']
    this.reporterOptions = opts.reporterOptions ?? {}
    this.skipFull = opts.skipFull ?? false

    this.includedUrlCache = new Map()
  }

  normalizeUrl (v8ReportResult) {
    if (/^node:/.test(v8ReportResult.url)) {
      v8ReportResult.url = `${v8ReportResult.url.replace(/^node:/, '')}.js`
    }

    if (/^file:\/\//.test(v8ReportResult.url)) {
      v8ReportResult.url = fileURLToPath(v8ReportResult.url)
    }

    return v8ReportResult
  }

  isResultUrlIncluded (url) {
    const cacheResult = this.includedUrlCache.get(url)
    if (cacheResult !== undefined) return cacheResult

    const result = (this.includeRelative || isAbsolute(url)) && this.exclude.shouldInstrument(url)
    this.includedUrlCache.set(url, result)
    return result
  }

  async transformToCoverageMap (v8Reports) {
    const processedReports = v8Reports.filter(v8Report => Array.isArray(v8Report?.result))
      .map((v8Report) => ({
        result: v8Report.result
          .map(v8ReportResult => this.normalizeUrl(v8ReportResult))
          .filter(v8ReportResult => this.isResultUrlIncluded(v8ReportResult.url))
      }))

    const v8Report = processedReports.length > 1
      ? require('@bcoe/v8-coverage').mergeProcessCovs(processedReports)
      : processedReports[0]

    const coverageMap = libCoverage.createCoverageMap()
    for (const v8ReportResult of v8Report.result) {
      const converter = v8ToIstanbul(v8ReportResult.url)
      await converter.load()
      converter.applyCoverage(v8ReportResult.functions)
      coverageMap.merge(converter.toIstanbul())
    }

    return coverageMap
  }

  report (coverageMap) {
    const context = libReport.createContext({
      dir: this.reportsDirectory,
      watermarks: this.watermarks,
      coverageMap
    })

    for (const reporter of this.reporters) {
      reports.create(reporter, {
        skipEmpty: false,
        skipFull: this.skipFull,
        maxCols: process.stdout.columns || 100,
        ...this.reporterOptions[reporter]
      }).execute(context)
    }
  }
}

module.exports = Transformer
