import { Driver } from '../../src'

describe('waitUntilSuccessHandler and waitUntilRejectHandler global listeners', () => {
  let client: Driver

  beforeEach(async () => {
    client = new Driver()

    client.start({
      notSilent: true,
      waitUntilRejectOnTimeout: false
    })
  })

  afterEach(async () => {
    await client.destroy()
  })

  it('one can install global listeners to be notified on all  successful predicate match', async () => {
    let state = { name: 'state1', predicate: null, data: null }
    client.options.waitUntilSuccessHandler = (data, predicate) => {
      state.name = 'state2'
      state.predicate = predicate
      state.data = data
    }
    await client.enter(`node -p "'hello_'+(33+4+1)+'_world'"`)
    expect(state.predicate).toBe(null)
    let data = await client.waitForData('hello_38_world')
    expect(data).toContain('hello_38_world')
    expect(state.name).toBe('state2')
    expect(state.predicate.originalPredicate).toBe('hello_38_world') // the predicate must be passed to the listener
    expect(state.data).toContain('hello_38_world')
    await client.enter(`node -p "'7/5=='+(7/5)"`, 100)
    const predicate1 = async () => {
      const latestData = await client.getDataFromLastWrite()
      return latestData.includes('7/5==1.4')
    }
    await client.waitUntil(predicate1)
    expect(state.predicate).toBe(predicate1) // the predicate must be passed to the listener
  })

  it('one can install global listeners for wait-until timeout errors', async () => {
    let state = { name: 'state', predicate: null, error: null }
    client.options.waitUntilTimeoutHandler = (error, predicate) => {
      state.name = 'state3'
      state.predicate = predicate
      state.error = error
    }
    await client.enter(`node -p "'hello_'+(33+4+1)+'_world'"`)
    expect(state.predicate).toBe(null)
    await client.waitForData('will never happen', 100, 50)
    expect(state.name).toBe('state3')
    expect(state.predicate.originalPredicate).toBe('will never happen') // the predicate must be passed to the listener

    await client.enter(`node -p "'7/5=='+(7/5)"`)
    const predicate1 = async () => {
      return false
    }
    await client.waitUntil(predicate1, 100, 50)
    expect(state.error.type).toBe(Driver.ERROR_TYPE)
    expect(state.predicate).toBe(predicate1)
  })
})
