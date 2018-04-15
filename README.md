[![Build Status](https://travis-ci.org/cancerberoSgx/cli-driver.png?branch=master)](https://travis-ci.org/cancerberoSgx/cli-driver) [![appveyor Build status](https://ci.appveyor.com/api/projects/status/w3ynfan159ejobkv/branch/master?svg=true)](https://ci.appveyor.com/project/cancerberoSgx/cli-driver/branch/master) [![codecov](https://codecov.io/gh/cancerberoSgx/cli-driver/branch/master/graph/badge.svg)](https://codecov.io/gh/cancerberoSgx/cli-driver/tree/master/packages/cli-driver/src) [![dependencies](https://david-dm.org/cancerberosgx/cli-driver/status.svg)](https://david-dm.org/cancerberosgx/cli-driver?path=packages/cli-driver) [![devDependencies](https://david-dm.org/cancerberosgx/cli-driver/dev-status.svg)](https://david-dm.org/cancerberosgx/cli-driver-dev?path=packages/cli-driver#info=devDependencies)


### *cli-driver*: like webdriver but for the command line

*See [Demo](#demo) !*

*[See the documentation](https://cancerberosgx.github.io/cli-driver)*

You should start in [Driver class](https://cancerberosgx.github.io/cli-driver/classes/driver.html)



# Install

```sh
npm install cli-driver
```

`npm install` requires some tools to be present in the system like Python and C++ compiler. Windows users can easily install them by running the following command in PowerShell as administrator. For more information see https://github.com/felixrieseberg/windows-build-tools: 

```sh
npm install --global --production windows-build-tools
```

# [API Documentation](https://cancerberosgx.github.io/cli-driver)

[API Documentation](https://cancerberosgx.github.io/cli-driver)


# Usage

In the following example we instruct the driver to perform the `ls` command and wait until it prints `package.json` file that we know it should be in the output:

```js
import {Driver} from 'cli-driver'
const client = new Driver()
client.start()
client.enter('ls')
// now we wait until package.json is printed in stdout
const data = await client.waitForData(data => data.includes('package.json'))
expect(data).toContain('package.json')
expect(data).toContain('tsconfig.json')
client.destroy()
```

Note you could also `require()` it like this: `const Driver = require('cli-driver').Driver`

See [Driver class API docs](https://cancerberosgx.github.io/cli-driver/driver.html)


## Example: Using async/await or good old promises

In the previous example you can notice we used `await` before `client.waitForData()` which allow us to write clean code to handle asynchrony. But if you can't or don't want to do that you can always use good old promises:

```js
client.waitForData(data => data.includes('package.json'))
  .then(data => {
  expect(data).toContain('package.json')
  expect(data).toContain('tsconfig.json')
  client.destroy()
})

```


## Example: Instrument npm init

The following example will create a folder, and execute npm init command answering all the questions:

```js
import {Driver} from 'cli-driver'
import * as shell from 'shelljs'

const projectPath = 'my-cool-npm-project'
shell.mkdir('-p', projectPath)

const client = new Driver()
await client.start({
  cwd: projectPath
})
await client.enter('npm init')

// will wait until stdout prints 'package name:' and then enter the project name 'changed-my-mind-project'
await client.waitForDataAndEnter('package name:', 'changed-my-mind-project')
await client.waitForDataAndEnter('version:', '') // just press enter to use default version (1.0.0)
await client.waitForDataAndEnter('description:', 'cool description')
await client.waitForDataAndEnter('entry point:', 'src/index.js')
await client.waitForDataAndEnter('test command:', 'jasmine')
await client.waitForDataAndEnter('git repository:', '')
await client.waitForDataAndEnter('keywords:', '')
await client.waitForDataAndEnter('author:', '')
await client.waitForDataAndEnter('license:', '')
await client.waitForDataAndEnter('Is this ok?', '')

await client.wait(300) // give npm some time to write the file

const packageJson = JSON.parse(shell.cat(`${projectPath}/package.json`))
expect(packageJson.name).toBe('changed-my-mind-project')
expect(packageJson.version).toBe('1.0.0')
expect(packageJson.description).toBe('cool description')
expect(packageJson.main).toBe('src/index.js')

```

# Why ?

I'm author of plenty packages that use interactive CLI, like yeoman generators and inquirer-based stuff and I would really like to implement integration tests, not just mocking the CLI, but test them in the real worl in different operating systems. 

There is a similar node package, [node-suppose](https://github.com/jprichardson/node-suppose) that attack the same problem, but IMO the UNIX API and semantics is very limited for today days and I wanted an API more imperative, similar to webdriver. 


# <a name="demo"></a> Demo

[This code](https://github.com/cancerberoSgx/cli-driver/blob/master/packages/sample-app-using-inquirer/spec/pizzaSpec.ts) automates an example program based on [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/). It not only test for validation and entering data but also that the output of the program is correct. 

This looks like in Linux bash terminal: 

![cli-driver example in Linux bash terminal](https://cancerberosgx.github.io/cli-driver/doc-assets/pizza-automation.gif)

And this looks like in a Windows Power Shell: 

![cli-driver example in Windows Power Shell](https://cancerberosgx.github.io/cli-driver/doc-assets/pizza-automation-powershell.gif)
And this is in Windows cmd.exe terminal 

![cli-driver example in Windows cmd.exe terminal](https://cancerberosgx.github.io/cli-driver/doc-assets/pizza-automation-cmdexe.gif)

And this looks like in a Windows MINGW64 terminal: 

![cli-driver example in Windows MINGW64 terminal](https://cancerberosgx.github.io/cli-driver/doc-assets/pizza-automation-mingw64.gif)
