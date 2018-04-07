[![Build Status](https://travis-ci.org/cancerberoSgx/cli-driver.png?branch=master)](https://travis-ci.org/cancerberoSgx/cli-driver) 
[![appveyor Build status](https://ci.appveyor.com/api/projects/status/w3ynfan159ejobkv/branch/master?svg=true)](https://ci.appveyor.com/project/cancerberoSgx/cli-driver/branch/master)
[![dependencies](https://david-dm.org/cancerberosgx/cli-driver/status.svg)](https://david-dm.org/cancerberosgx/cli-driver?path=packages/cli-driver)
[![devDependencies](https://david-dm.org/cancerberosgx/cli-driver/dev-status.svg)](https://david-dm.org/cancerberosgx/cli-driver-dev?path=packages/cli-driver#info=devDependencies)

*cli-driver*: like webdriver but for the command line

# Usage

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

Note: as you can see we use async / await functions in the case of client.waitForData since is asynchronous and returns a promise. But you could also do it the old way: 



# Instrument npm init

TODO
