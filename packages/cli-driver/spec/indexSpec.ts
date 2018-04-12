import { Driver } from '../src'
import * as shell from 'shelljs'

describe('basics', () => {

  it('enter ls and waitForData until it prints package.json file', async (done) => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    const client = new Driver()
    await client.start()
    await client.enter('ls *.json')
    let data = await client.waitForData(data => data.includes('package.json'))
    expect(data).toContain('package.json')
    expect(data).toContain('tsconfig.json')
    expect(await client.getDataFromLastWrite()).toContain('package.json')

    // nwo test waituntil rejectOnTimeout
    await client.enter('ls')
    data = await client.waitForData('nonexistentdata', 200, undefined, undefined, false)
    expect(data).toBe(false)

    data = await client.waitForData({ predicate: 'nonexistentdata', timeout: 200,  rejectOnTimeout: false })
    expect(data).toBe(false)

    const state = await client.dumpState()
    expect(state.data.length).toBeGreaterThan(0)

    await client.enter('exit', 200)
    await client.destroy()
    done()
  })

})
