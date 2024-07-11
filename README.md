# bare-cov
Run tests with coverage

### Installation
```
npm i -g bare-cov
```

### Usage
```sh
# See help
bare-cov --help

# Run tests with coverage
bare-cov npm test

# Run tests with options
bare-cov --reporter=text,cobertura --reporter-options='{"cobertura": {"file": "coverage.xml"}}' npm test
```

### CLI Options
#### command
The command to run (e.g. `node`)

#### command-args
Arguments to pass to the command (e.g. `['foo.js']`)

#### reporter
Coverage reporter(s) to use as a comma-separated string (default: `text`)

#### reporter-options
Options to pass to each reporter as JSON object string (default: `{}`)

#### reports-dir
Directory where coverage reports will be saved (default: `./coverage`)
WARNING: This directory will be deleted before running the command

#### temp-dir
Directory where raw v8 coverage reports will be saved (default: `./{reportsDir}/tmp`)

*WARNING: This directory will be deleted before running the command unless --skip-cleanup is specified*

#### skip-full
Hide files with 100% coverage (default: `false`)

#### include-relative
Include scripts with relative paths in coverage report (default: `false`)

#### include
Specific files that should be covered as a JSON array string (default: `[]`)

#### exclude
Specific files and directories that should be excluded from coverage as a JSON array string (default: [link](https://github.com/istanbuljs/schema/blob/master/default-exclude.js))

#### extension
Specific file extensions that should be covered as a JSON array string (default: [link](https://github.com/istanbuljs/schema/blob/master/default-extension.js))

#### allow-external
Allow reporting on files outside of the current working directory

#### include-node-modules
Include node_modules folders in the report

#### skip-cleanup
Skip cleanup of temp directory before running command

# License
Apache-2.0
