// this is the spec in which we are working right now

import { Driver } from '../src'
import * as shell from 'shelljs'

describe('waitUntilSuccessHandler and waitUntilRejectHandler global listeners', () => {

  it('one can install global listeners to be notified on all  successful predicate match', async () => {

    expect(1).toBe(2)
    let client = new Driver()
    let state = { name: 'state1', predicate: null }
    client.start({
      // notSilent: true,
      // waitUntilRejectOnTimeout: false,
      waitUntilSuccessHandler: (data, predicate) => {
        console.log('PREDICATE', predicate)
        state.name = 'state2'
        state.predicate = predicate
      }
    })

    await client.enter(`node -p "'hello_'+(33+4+1)+'_world'"`, 100)
    let data = await client.waitForData('hello_38_world')
    expect(data).toContain('hello_38_world')
    await client.waitTime(400)
    expect(state.name).toBe('state2')
    expect(state.predicate.originalPredicates).toBe('hello_38_world') // the predicate must be passed to the listener

    await client.waitTime(2000)

    await client.enter(`node -p "'7/5=='+(7/5)"`, 100)
    const predicate1 = async () => {
      const latestData = await client.getDataFromLastWrite()
      return latestData.includes('7/5==1.4')
    }
    data = await client.waitUntil(predicate1)
    expect(state.predicate).toBe(predicate1) // the predicate must be passed to the listener

    await client.destroy()
  })

  // it('one can install global listeners to be notified on all wait-until timeout errors and on all successful predicate match', async () => {

  // })

})
