## Development documentation

### Project build

The project is managed using npm.

For a list of available task, type

```bash
npm run
```

The following sections show the available options in detail.

### Start

Runs a local version of Perseo-fe. Note that you should have a MongoDB instance running locally.

```bash
# Use git-bash on Windows
npm start
```

### Testing

[Mocha](https://mochajs.org/) Test Runner + [Should.js](https://shouldjs.github.io/) Assertion Library.

The test environment is preconfigured to run BDD testing style.

Module mocking during testing can be done with [proxyquire](https://github.com/thlorenz/proxyquire)

To run tests, type

```bash
npm test
```

#### Action endpoint load test

The opt-in load test in [`test/load/actions-load.test.js`](../../test/load/actions-load.test.js) exercises
`POST /actions/do` against the local Perseo-FE test server. It defaults to 500 requests with up to 64 requests in
flight, uses a local fake HTTP server for the outgoing SMS action, and reports throughput and latency percentiles. It is
not included in `npm test`.

Requests alternate between JSON bodies of exactly 1, 4 and 16 KiB (1,024, 4,096 and 16,384 UTF-8 bytes, excluding HTTP
headers). The test verifies serialized body sizes and reports the number of requests for each size.

Run it with:

```bash
npm run test:load:actions
```

The workload can be adjusted with `ACTION_LOAD_REQUESTS` (1–10,000) and `ACTION_LOAD_CONCURRENCY` (1–500), for example:

```bash
ACTION_LOAD_REQUESTS=1000 ACTION_LOAD_CONCURRENCY=100 npm run test:load:actions
```

Like the component tests, this test requires the test dependencies to be available, including MongoDB and the configured
Orion endpoint. The test harness clears test collections before and after the run, so use an isolated test environment
and never point it at production data.

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
