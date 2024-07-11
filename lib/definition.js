const { flag, arg, rest } = require('paparam')

const definition = [
  arg('<command>', 'Script to run'),
  rest('[...command-args]', 'Command arguments'),
  flag('--reporter|-r <reporter>', 'Coverage reporter(s) to use'),
  flag('--reporter-options|-R <reporterOptions>', 'Options to pass to the reporter'),
  flag('--reports-dir|-o <reportsDir>', 'Directory where coverage reports will be output to'),
  flag('--temp-dir|-t <tempDir>', 'Directory where raw v8 coverage reports will be output to'),
  flag('--skip-full', 'Hide 100% coverage files'),
  flag('--include-relative', 'Include relative paths from coverage report'),
  flag('--include|-n <include>', 'Specific files that should be covered'),
  flag('--exclude|-x <exclude>', 'Specific files and directories that should be excluded from coverage'),
  flag('--extension|-e <extension>', 'Specific file extensions that should be covered'),
  flag('--allow-external', 'Allow reporting on files outside of the current working directory'),
  flag('--include-node-modules', 'Include node_modules folders in the report'),
  flag('--skip-cleanup', 'Skip cleanup of temp directory after before command')
]

module.exports = definition
