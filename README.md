# bare-cov
Run tests with coverage

### Installation
```
npm i bare-cov
```

### Usage
```js
// Record coverage until current process ends and then generate reports
require('bare-cov')(options)
```

### Options
#### reporters
Coverage reporter(s) to use (default: `['text', 'json']`)

#### reporterOptions
Options to pass to each reporter keyed by reporter (default: `{}`)

#### dir
Directory to write coverage reports to (default: `coverage`)

#### skipFull
Hide files with 100% coverage (default: `false`)

#### includeRelative
Include scripts with relative paths in coverage report (default: `false`)

#### include
Specific files that should be covered (default: `[]`)

#### exclude
Specific files and directories that should be excluded from coverage (default: [link](https://github.com/istanbuljs/schema/blob/master/default-exclude.js))

#### extension
Specific file extensions that should be covered (default: [link](https://github.com/istanbuljs/schema/blob/master/default-extension.js))

#### allowExternal
Allow reporting on files outside of the current working directory (default: `false`)

#### includeNodeModules
Include node_modules folders in the report (default: `false`)

#### skipRawDump
Skip saving of raw v8 coverage data to disk (default: `false`)

# License
Apache-2.0
