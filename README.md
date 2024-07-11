# bare-cov
Run tests with coverage

### Installation
```
npm i bare-cov
```

### Usage
```js
require('bare-cov')(options)
```

Will start recording coverage until the application ends.
The coverage report will be generated and displayed in the console.

### Options
#### reporter
Coverage reporter(s) to use as a comma-separated string (default: `text`)

#### reporterOptions
Options to pass to each reporter as JSON object string (default: `{}`)

*WARNING: This directory will be deleted before running the command unless --skip-cleanup is specified*

#### skipFull
Hide files with 100% coverage (default: `false`)

#### includeRelative
Include scripts with relative paths in coverage report (default: `false`)

#### include
Specific files that should be covered as a JSON array string (default: `[]`)

#### exclude
Specific files and directories that should be excluded from coverage as a JSON array string (default: [link](https://github.com/istanbuljs/schema/blob/master/default-exclude.js))

#### extension
Specific file extensions that should be covered as a JSON array string (default: [link](https://github.com/istanbuljs/schema/blob/master/default-extension.js))

#### allowExternal
Allow reporting on files outside of the current working directory (default: `false`)

#### includeNodeModules
Include node_modules folders in the report (default: `false`)

# License
Apache-2.0
