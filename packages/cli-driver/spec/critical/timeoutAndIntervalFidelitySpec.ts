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

  it('just to have an idea of how accurate are timeouts and intervals in reality', async () => {

    if (process.platform !== 'linux') {
      pending('Windows and Darwin platforms fail in fidelity big deal!')
    }

    if (process.platform === 'win32') {
      pending('this test dont work well in windows, investigating...')
    }

    let timeoutRequested = 500
    let intervalRequested = 50
    let result = await takeMeasuresOfIntervalsAndTimeouts(client, timeoutRequested, intervalRequested)
    if (Math.abs(result.totalTime - result.timeoutRequested) > timeoutRequested / 90) {
      fail(`timeout accuracy (small timeout) because: ${Math.abs(result.totalTime - result.timeoutRequested)} > ${timeoutRequested / 90}`)
    }
    if (Math.abs(result.intervalRequested - result.realIntervalLength) > intervalRequested / 3) {// <-- !!this is bad
      fail(`timeout accuracy (small timeout) because: ${Math.abs(result.intervalRequested - result.realIntervalLength)} > ${intervalRequested / 3}`)
    }
    console.log(result)

    timeoutRequested = 2000
    result = await takeMeasuresOfIntervalsAndTimeouts(client, timeoutRequested, intervalRequested)

    if (Math.abs(result.totalTime - result.timeoutRequested) > timeoutRequested / 800) {
      fail(`timeout accuracy (mid timeout) because: ${Math.abs(result.totalTime - result.timeoutRequested / 800)} > ${timeoutRequested} `)
    }
    if (Math.abs(result.intervalRequested - result.realIntervalLength) > intervalRequested / 10) {
      fail(`interval accuracy (mid timeout) : ${Math.abs(result.intervalRequested - result.realIntervalLength / 10)} > ${intervalRequested}`)
    }
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
