[![Build Status](https://travis-ci.org/cancerberoSgx/cli-driver.png?branch=master)](https://travis-ci.org/cancerberoSgx/cli-driver) [![appveyor Build status](https://ci.appveyor.com/api/projects/status/w3ynfan159ejobkv/branch/master?svg=true)](https://ci.appveyor.com/project/cancerberoSgx/cli-driver/branch/master) [![dependencies](https://david-dm.org/cancerberosgx/cli-driver/status.svg)](https://david-dm.org/cancerberosgx/cli-driver?path=packages/cli-driver) [![devDependencies](https://david-dm.org/cancerberosgx/cli-driver/dev-status.svg)](https://david-dm.org/cancerberosgx/cli-driver-dev?path=packages/cli-driver#info=devDependencies)

*cli-driver*: like webdriver but for the command line


# Install

```sh
npm install cli-driver
```

`npm install` requires some tools to be present in the system like Python and C++ compiler. Windows users can easily install them by running the following command in PowerShell as administrator. For more information see https://github.com/felixrieseberg/windows-build-tools: 

```sh
npm install --global --production windows-build-tools
```

# Usage

```js
const client = new Driver()
client.start()
client.enter('ls')
// now we wait until package.json is printed in stdout
const data = await client.waitForData(data => data.includes('package.json'))
expect(data).toContain('package.json')
expect(data).toContain('tsconfig.json')
client.destroy()
```

## Example: Using async/await or good old promises

```js
import Driver from 'cli-driver'

describe('pretty specs for readme', () => {
  it('enter ls command should print package.json and tsconfig.json file', async () => {
    const client = new Driver()
    client.start()
    client.enter('ls')
    // now we wait until package.json is printed in stdout
    const data = await client.waitForData(data => data.includes('package.json'))
    expect(data).toContain('package.json')
    expect(data).toContain('tsconfig.json')
    client.destroy()
  })

  it('same as before but without async/await just good-old then()', (done) => {
    const client = new Driver()
    client.start()
    client.enter('ls')
    // now we wait until package.json is printed in stdout
    client.waitForData(data => data.includes('package.json')).then(data => {
      expect(data).toContain('package.json')
      expect(data).toContain('tsconfig.json')
      client.destroy()
      done()
    })
  })
})

```


## Example: Instrument npm init

```js
import Driver from 'cli-driver'
import * as path from 'path'
import * as shell from 'shelljs'

describe('automating npm init command', () => {
  it('npm init should create a package.json with filled information', async () => {
    const projectPath = path.join('spec', 'tmp', 'my-cool-npm-project')
    shell.rm('-rf', projectPath)
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

    shell.rm('-rf', projectPath)
  })
})
```

# Why ?

I'm author of plenty packages that use interactive CLI, like yeoman generators and inquirer-based stuff and I would really like to implement integration tests, not just mocking the CLI, but test them in the real worl in different operating systems. 

There is a similar node package, [node-suppose](https://github.com/jprichardson/node-suppose) that attack the same problem, but IMO the UNIX API and semantics is very limited for today days and I wanted an API more imperative, similar to webdriver. 