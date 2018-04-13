// this is the spec in which we are working right now

import { Driver } from '../../src'
import * as shell from 'shelljs'

describe('waitUntil timeouts and interval fidelity', () => {
  let client: Driver

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
    client = new Driver()
    await client.start()
    await client.waitTime(200)
  })

  afterAll(async () => {
    await client.destroy()
  })

  it('timeouts&intervals should be more or less what they say they are... ', async () => {

    let timeoutRequested = 500
    let intervalRequested = 50
    let postfix
    let result = await takeMeasuresOfIntervalsAndTimeouts(client, timeoutRequested, intervalRequested)
    postfix = ' timeout accuracy'
    expect(Math.abs(result.totalTime - result.timeoutRequested) + postfix).toBeLessThan((timeoutRequested / 95) + postfix)
    postfix = ' interval accuracy'
    expect(Math.abs(result.intervalRequested - result.realIntervalLength)).toBeLessThan(intervalRequested / 3) // <-- !!this is bad

    timeoutRequested = 2000
    postfix = ' timeout accuracy'
    result = await takeMeasuresOfIntervalsAndTimeouts(client, timeoutRequested, intervalRequested)

    postfix = ' interval accuracy'
    expect(Math.abs(result.totalTime - result.timeoutRequested) + postfix).toBeLessThan((timeoutRequested / 900) + postfix)
    expect(Math.abs(result.intervalRequested - result.realIntervalLength)).toBeLessThan(intervalRequested / 10)
    console.log(result)
  })
})

function takeMeasuresOfIntervalsAndTimeouts (client, timeoutRequested, intervalRequested) {
  let t = Date.now()
  let intervalCount = 0
  let totalTime

  return client
    .waitUntil({
      predicate: () => {
        intervalCount += 1
      },
      timeout: timeoutRequested,
      interval: intervalRequested,
      rejectOnTimeout: false
    })
    .then(data => {
      totalTime = Date.now() - t
      expect((data as any).type as any).toBe(Driver.ERROR_TYPE)
      expect((data as any).code as any).toBe(Driver.ERROR_WAITUNTIL_TIMEOUT)
      return client.waitTime(200)
    })
    .catch(ex => {
      fail('rejectOnTimeout=false should resolve the promise')
    })
    .then(() => {
      let intervalCountShouldBeTheoretical = timeoutRequested / intervalRequested
      let realIntervalLength = totalTime / intervalCount
      let result = { totalTime, timeoutRequested,
        intervalCount, intervalCountShouldBeTheoretical,
        realIntervalLength, intervalRequested }
      return Promise.resolve(result)
    })
}
