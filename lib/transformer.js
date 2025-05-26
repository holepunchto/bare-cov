'use strict'

const { isAbsolute } = require('path')
const { fileURLToPath } = require('url')
const v8ToIstanbul = require('bare-v8-to-istanbul')
const TestExclude = require('./test-exclude')
const summarize = require('./summarize')
const report = require('./report')
const merge = require('./merge')

class Transformer {
  constructor (opts = {}) {
    this.includeRelative = opts.includeRelative ?? false
    this.exclude = new TestExclude()
    this.includedUrlCache = new Map()
    this.coverages = {}
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

  async add (rawV8Report) {
    const v8Report = {
      result: rawV8Report.result
        .map(v8ReportResult => this.normalizeUrl(v8ReportResult))
        .filter(v8ReportResult => this.isResultUrlIncluded(v8ReportResult.url))
    }

    for (const v8ReportResult of v8Report.result) {
      const converter = v8ToIstanbul(v8ReportResult.url)
      await converter.load()
      converter.applyCoverage(v8ReportResult.functions)
      const converted = converter.toIstanbul()

      for (const [path, coverage] of Object.entries(converted)) {
        this.coverages[path] = this.coverages[path] ? merge(this.coverages[path], coverage) : coverage
      }
    }

    return this.coverages
  }

  report (coverage = this.coverages) {
    report(summarize(coverage))
  }
}

module.exports = Transformer
