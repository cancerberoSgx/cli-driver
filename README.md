[![Build Status](https://travis-ci.org/cancerberoSgx/cli-driver.png?branch=master)](https://travis-ci.org/cancerberoSgx/cli-driver) [![appveyor Build status](https://ci.appveyor.com/api/projects/status/w3ynfan159ejobkv/branch/master?svg=true)](https://ci.appveyor.com/project/cancerberoSgx/cli-driver/branch/master) [![dependencies](https://david-dm.org/cancerberosgx/cli-driver/status.svg)](https://david-dm.org/cancerberosgx/cli-driver?path=packages/cli-driver) [![devDependencies](https://david-dm.org/cancerberosgx/cli-driver/dev-status.svg)](https://david-dm.org/cancerberosgx/cli-driver-dev?path=packages/cli-driver#info=devDependencies)

*cli-driver*: like webdriver but for the command line

# Usage

```sh
npm install cli-driver
```

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


# Instrument npm init

TODO


# Why ?

I'm author of plenty packages that use interactive CLI, like yeoman generators and inquirer-based stuff and I would really like to implement integration tests, not just mocking the CLI, but test them in the real worl in different operating systems. 

There is a similar node package, [node-suppose](https://github.com/jprichardson/node-suppose) that attack the same problem, but IMO the UNIX API and semantics is very limited for today days and I wanted an API more imperative, similar to webdriver. 