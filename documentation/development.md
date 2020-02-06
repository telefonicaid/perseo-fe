## Development documentation

### Project build

The project is managed using npm.

For a list of available task, type

```bash
npm run
```

The following sections show the available options in detail.

### Testing

[Mocha](https://mochajs.org/) Test Runner + [Should.js](https://shouldjs.github.io/) Assertion Library.

The test environment is preconfigured to run BDD testing style.

Module mocking during testing can be done with [proxyquire](https://github.com/thlorenz/proxyquire)

To run tests, type

```bash
npm test
```

### Coding guidelines

jshint

Uses the provided `.jshintrc` flag file. To check source code style, type

```bash
npm run lint
```

### Documentation guidelines

remark

Uses the provided `.remarkrc.js` flag file. To check consistency of the Markdown markup, type

```bash
npm run lint:md
```

textlint

Uses the provided `.textlintrc` flag file. To check for spelling and grammar errors, dead links and keyword consistency,
type

```bash
npm run lint:text
```

### Continuous testing

Support for continuous testing by modifying a src file or a test. For continuous testing, type

```bash
npm run test:watch
```

If you want to continuously check also source code style, use instead:

```bash
npm run watch
```

### Code Coverage

Istanbul

Analizes the code coverage of your tests.

To generate an HTML coverage report under `site/coverage/` and to print out a summary, type

```bash
# Use git-bash on Windows
npm run test:coverage
```

### Clean

Removes `node_modules` and `coverage` folders, and `package-lock.json` file so that a fresh copy of the project is
restored.

```bash
# Use git-bash on Windows
npm run clean
```

### Prettify Code

Runs the [prettier](https://prettier.io) code formatter to ensure consistent code style (whitespacing, parameter
placement and breakup of long lines etc.) within the codebase.

```bash
# Use git-bash on Windows
npm run prettier
```

To ensure consistent Markdown formatting run the following:

```bash
# Use git-bash on Windows
npm run prettier:text
```

### Swagger

In order to run Swagger, you need to execute the Perseo FE (as explained [here](deployment.md)) and then you can access
to:

```
<server_host>:9090/api-docs
```

The swagger documentation provided at /api-docs covers all the HTTP endpoint exposed by Perseo FE.

