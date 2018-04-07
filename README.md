[![Build Status](https://travis-ci.org/cancerberoSgx/cli-driver.png?branch=master)](https://travis-ci.org/cancerberoSgx/cli-driver)
[![Greenkeeper badge](https://badges.greenkeeper.io/cancerberoSgx/cli-driver.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/cancerberosgx/cli-driver.svg)](https://david-dm.org/cancerberosgx/cli-driver)


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