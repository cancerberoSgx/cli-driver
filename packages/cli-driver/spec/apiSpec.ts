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
  it(`${methodName} should reject promise if interval is greater than timeouts - await`, async (done) => {
    try {
      await client[methodName]({ predicate: () => false, timeout: 40, interval: 50, input: 'foo'  })
      fail()
    } catch (error) {
      expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
      done()
    }
  })
  it(`${methodName} should reject promise if interval is greater than timeout - no await`, (done) => {
    resolved.then(() => client[methodName]({ predicate: () => false, timeout: 40, interval: 50, input: 'foo'  }))
      .then(fail)
      .catch((error) => {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      })
  })
  it(`${methodName} should reject promise on timeout - await`, async (done) => {
    try {
      await client[methodName]({ predicate: () => false, timeout: 40, interval: 15, input: 'foo' })
      fail()
    } catch (error) {
      expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
      done()
    }
  })
  it(`${methodName} should reject promise on timeout  - no await`, (done) => {
    resolved.then(() => client[methodName]({ predicate: () => false, timeout: 40, interval: 15, input: 'foo'  }))
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
  it(`${methodName} should resolve a promise with error if interval is greater than timeout - await`, async (done) => {
    try {
      const result = await client[methodName]({ predicate: () => false, timeout: 40, interval: 50, input: 'foo', rejectOnTimeout: false  })
      if (result && result.type === Driver.ERROR_TYPE) {
        expect(result.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      } else {
        fail(`${methodName} should resolve promise with correct object type`)
      }
      done()
    } catch (error) {
      fail(`${methodName} should not reject promise if waitUntilRejectOnTimeout===false`)
    }
  })
  it(`${methodName} should resolve a promise with error if interval is greater than timeout - no await`, (done) => {
    client[methodName]({ predicate: () => false, timeout: 40, interval: 50, input: 'foo' , rejectOnTimeout: false })
    .then(result => {
      if (result && result.type === Driver.ERROR_TYPE) {
        expect(result.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      } else {
        fail(`${methodName} should resolve promise with correct object type`)
      }
    })
    .catch(ex => {
      fail(`${methodName} should not reject promise if waitUntilRejectOnTimeout===false`)
    })
  })
  it(`${methodName} should resolve promise with error object on timeout - await`, async (done) => {
    try {
      const result = await client[methodName]({ predicate: () => false, timeout: 40, interval: 15, input: 'foo', rejectOnTimeout: false })
      if (result && result.type === Driver.ERROR_TYPE) {
        expect(result.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
        done()
      } else {
        fail(`${methodName} should resolve promise with correct object type`)
      }
    } catch (error) {
      fail(`${methodName} should not reject promise if waitUntilRejectOnTimeout===false`)
    }
  })
  it(`${methodName} should resolve promise with error object on timeout- no await`, (done) => {
    client[methodName]({ predicate: () => false, timeout: 40, interval: 15, input: 'foo' , rejectOnTimeout: false, seba: true })
      .then((result => {
        if (result && result.type === Driver.ERROR_TYPE) {
          expect(result.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
          done()
        } else {
          fail(`${methodName} should resolve promise with correct object type`)
        }
      }))
      .catch(error => {
        fail(`${methodName} should not reject promise if waitUntilRejectOnTimeout===false`)
      })
  })

}

describe('api', () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000

  const allWaitMethodNames = ['waitUntil', 'waitForData', 'waitForDataAndWrite', 'waitForDataAndEnter', 'writeAndWaitForData', 'enterAndWaitForData']

  describe('wait* timeouts', () => {
    allWaitMethodNames.forEach(methodName => {
      describe(`${methodName} timeout errors`,() => {
        runTimeoutErrors(methodName)
      })
    })
  })

  describe('wait* timeouts when rejectOnTimeout===false', () => {
    allWaitMethodNames
    .forEach(methodName => {
      describe(`${methodName} timeouts errors when rejectOnTimeout===false`,() => {
        runTimeoutErrors_waitUntilRejectOnTimeout(methodName)
      })
    })

  })

})
