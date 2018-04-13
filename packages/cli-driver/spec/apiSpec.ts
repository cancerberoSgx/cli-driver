import { Driver } from '../src'

function runTimeoutErrors (methodName) {
  let resolved: Promise<void>
  let client: Driver
  beforeEach(async () => {
    client = new Driver()
    resolved = Promise.resolve()
    await client.start()
  })
  afterEach(async () => {
    await client.destroy()
  })
  it(`${methodName} should reject promise if interval is greater than timeout - await`, async (done) => {
    try {
      await client[methodName]({ predicate: 'dontexists', timeout: 40, interval: 50, input: 'foo'  })
      fail()
    } catch (error) {
      expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
      done()
    }
  })
  it(`${methodName} should reject promise if interval is greater than timeout - no await`, (done) => {
    resolved.then(() => client[methodName]({ predicate: 'dontexists', timeout: 40, interval: 50, input: 'foo'  }))
      .then(fail)
      .catch((error) => {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      })
  })
  it(`${methodName} should reject promise on timeout - await`, async (done) => {
    try {
      await client[methodName]({ predicate: 'dontexists', timeout: 40, interval: 15, input: 'foo' })
      fail()
    } catch (error) {
      expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
      done()
    }
  })
  it(`${methodName} should reject promise on timeout  - no await`, (done) => {
    resolved.then(() => client[methodName]({ predicate: 'dontexists', timeout: 40, interval: 15, input: 'foo'  }))
      .then(fail)
      .catch((error) => {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
        done()
      })
  })
}

function runTimeoutErrors_waitUntilRejectOnTimeout (methodName) {
  let resolved: Promise<void>
  let client: Driver
  beforeEach(async () => {
    client = new Driver()
    resolved = Promise.resolve()
    await client.start({ waitUntilRejectOnTimeout: false })
  })
  afterEach(async () => {
    await client.destroy()
  })
  it(`${methodName} should resolve a promise with error and waitUntilRejectOnTimeout===false if interval is greater than timeout - await`, async (done) => {
    try {
      const result = await client[methodName]({ predicate: 'dontexists', timeout: 40, interval: 50, input: 'foo'  })
      if (result && result.type === Driver.ERROR_TYPE) {
        expect(result.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      } else {
        fail('promise should be resolved with correct error')
      }
      done()
    } catch (error) {
      fail(`${methodName} should not reject promise if waitUntilRejectOnTimeout===false`)
    }
  })
}

describe('api', () => {

  describe('wait* timeouts', () => {
    describe('waitUntil timeout errors',() => {
      runTimeoutErrors('waitUntil')
    })
    describe('waitForData timeout errors', () => {
      runTimeoutErrors('waitForData')
    })
    describe('waitForDataAndWrite timeout errors', () => {
      runTimeoutErrors('waitForDataAndWrite')
    })
    describe('waitForDataAndEnter timeout errors', () => {
      runTimeoutErrors('waitForDataAndEnter')
    })
    describe('writeAndWaitForData timeout errors', () => {
      runTimeoutErrors('writeAndWaitForData')
    })
    describe('enterAndWaitForData timeout errors', () => {
      runTimeoutErrors('enterAndWaitForData')
    })
  })

  describe('wait* timeouts when rejectOnTimeout===false', () => {
    describe('waitUntil timeouts errors when rejectOnTimeout===false',() => {
      runTimeoutErrors_waitUntilRejectOnTimeout('waitUntil')
    })

  })

})
