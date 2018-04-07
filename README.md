[![Build Status](https://travis-ci.org/cancerberoSgx/cli-driver.png?branch=master)](https://travis-ci.org/cancerberoSgx/cli-driver)

[![Appveyor build status](https://ci.appveyor.com/api/projects/status/1064dcr2t2r90q4n/branch/master?svg=true)](https://ci.appveyor.com/project/cancerberosgx/cli-driver/branch/master)

[![dependencies](https://david-dm.org/cancerberosgx/cli-driver/status.svg)](https://david-dm.org/cancerberosgx/cli-driver?path=packages/cli-driver)
[![devDependencies](https://david-dm.org/cancerberosgx/cli-driver/dev-status.svg)](https://david-dm.org/cancerberosgx/cli-driver-dev?path=packages/cli-driver#info=devDependencies)

*cli-driver*: like web-driver but for the command line

```js
import Driver from 'cli-driver'
const client = new Driver()
await client.start()
setTimeout(() => {
  client.enter('ls')
}, 1000)
let data1 = await client.waitForData()
expect(data1).toContain('package.json')
```

# Instrument npm init

TODO