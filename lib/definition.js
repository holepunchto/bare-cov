const { flag, arg, rest } = require('paparam')

const definition = [
  arg('<command>', 'Command to run'),
  rest('[...command-args]', 'Command arguments'),
  flag('--reporter|-r <reporter>', 'Coverage reporter(s) to use (comma separated)'),
  flag('--reporter-options|-R <reporterOptions>', 'Options to pass to each reporter (JSON object string)'),
  flag('--reports-dir|-o <reportsDir>', 'Directory where coverage reports will be saved'),
  flag('--temp-dir|-t <tempDir>', 'Directory where raw v8 coverage reports will be saved'),
  flag('--skip-full', 'Hide files with 100% coverage'),
  flag('--include-relative', 'Include scripts with relative paths in coverage report '),
  flag('--include|-n <include>', 'Specific files that should be covered (JSON array string)'),
  flag('--exclude|-x <exclude>', 'Specific files and directories that should be excluded from coverage (JSON array string)'),
  flag('--extension|-e <extension>', 'Specific file extensions that should be covered (JSON array string)'),
  flag('--allow-external', 'Allow reporting on files outside of the current working directory'),
  flag('--include-node-modules', 'Include node_modules folders in the report'),
  flag('--skip-cleanup', 'Skip cleanup of temp directory before running command')
]

module.exports = definition
