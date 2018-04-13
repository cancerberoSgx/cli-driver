import { Driver } from '../src'

describe('api', () => {

  describe('wait* timeouts', () => {
    let client: Driver
    let resolved: Promise<void>
    beforeEach(async () => {
      client = new Driver()
      await client.start()
      resolved = Promise.resolve()
    })

    it('waitUntil should reject promise if interval is greater than timeout - await', async (done) => {
      try {
        await client.waitUntil({ predicate: () => false, timeout: 100, interval: 200 })
        fail()
      } catch (error) {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      }
    })
    it('waitUntil should reject promise if interval is greater than timeout - no await', async (done) => {
      resolved.then(() => client.waitUntil({ predicate: () => false, timeout: 100, interval: 200 }))
        .then(fail)
        .catch((error) => {
          expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
          done()
        })
    })
    it('waitUntil should reject promise on timeout - await', async (done) => {
      try {
        await client.waitUntil({ predicate: () => false, timeout: 100, interval: 20 })
        fail()
      } catch (error) {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
        done()
      }
    })
    it('waitUntil should reject promise on timeout  - no await', async (done) => {
      resolved.then(() => client.waitUntil({ predicate: () => false, timeout: 100, interval: 20 }))
        .then(fail)
        .catch((error) => {
          expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
          done()
        })
    })




    it('waitForData should reject promise if interval is greater than timeout - await', async (done) => {
      try {
        await client.waitForData({ predicate: 'dontexists', timeout: 100, interval: 200 })
        fail()
      } catch (error) {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
        done()
      }
    })
    it('waitForData should reject promise if interval is greater than timeout - no await', async (done) => {
      resolved.then(() => client.waitForData({ predicate: 'dontexists', timeout: 100, interval: 200 }))
        .then(fail)
        .catch((error) => {
          expect(error.code).toBe(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
          done()
        })
    })
    it('waitForData should reject promise on timeout - await', async (done) => {
      try {
        await client.waitForData({ predicate: 'dontexists', timeout: 100, interval: 20 })
        fail()
      } catch (error) {
        expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
        done()
      }
    })
    it('waitForData should reject promise on timeout  - no await', async (done) => {
      resolved.then(() => client.waitForData({ predicate: 'dontexists', timeout: 100, interval: 20 }))
        .then(fail)
        .catch((error) => {
          expect(error.code).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
          done()
        })
    })

  })
})
