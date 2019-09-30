# Development documentation (Third Iteration)

## ESLint

ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. In many ways, it is
similar to JSLint and JSHint with a few exceptions:

-   ESLint uses Espree for JavaScript parsing.
-   ESLint uses an AST to evaluate patterns in code.
-   ESLint is completely pluggable, every single rule is a plugin and you can add more at runtime.

### Installation and Usage

#### Command-line

Prerequisites: [Node.js](https://nodejs.org/) (`^8.10.0`, `^10.13.0`, or `>=11.10.1`), npm version 3+.

You can install ESLint using npm:

```
$ npm install eslint --save-dev
```

You should then set up a configuration file:

```
$ ./node_modules/.bin/eslint --init
```

After that, you can run ESLint on any file or directory like this:

````
$ ./node_modules/.bin/eslint yourfile.js

After running `eslint --init`, you'll have a `.eslintrc` file in your directory. In it, you'll see some rules configured like this:

```json
{
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "double"]
    }
}
````

The names `"semi"` and `"quotes"` are the names of rules in ESLint. The first value is the error level of the rule and
can be one of these values:

-   `"off"` or `0` - turn the rule off
-   `"warn"` or `1` - turn the rule on as a warning (doesn't affect exit code)
-   `"error"` or `2` - turn the rule on as an error (exit code will be 1)

The three error levels allow you fine-grained control over how ESLint applies rules (for more configuration options and
details, see the [configuration docs](https://eslint.org/docs/user-guide/configuring)).

#### Integrations with code editors

With ESLint properly configured in your editor, your development experience can be careful. it’ll help you produce
better quality code and teach you as you work.

Below we will list the main IDEs and their link to the configuration of the ESLint plugin for the improvement of your
code.

-   Sublime Text 3: [SublimeLinter-eslint](https://github.com/SublimeLinter/SublimeLinter-eslint)
-   Vim: [ALE](https://github.com/dense-analysis/ale)
-   Emacs: [FlyChecks](http://www.flycheck.org/en/latest/)
-   Eclipse Orion: [ESLint](https://www.eclipse.org/lists/orion-dev/msg02718.html)
-   Eclipse IDE: [Tern ESLint linter](https://github.com/angelozerr/tern.java/wiki/Tern-Linter-ESLint)
-   TextMate 2: [ESLint Bundle](https://github.com/natesilva/javascript-eslint.tmbundle)
-   Atom: [linter-eslint](https://atom.io/packages/linter-eslint)
-   IntelliJ IDEA, RubyMine, WebStorm, PhpStorm, PyCharm, AppCode, Android Studio, 0xDBE:
    [ESLint Plugin](https://plugins.jetbrains.com/plugin/7494-eslint)
-   Visual Studio Code: [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
-   Brackets: [Included and Brackets ESLint](https://github.com/brackets-userland/brackets-eslint)
