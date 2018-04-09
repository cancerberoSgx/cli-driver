import Driver from '../src/index'
import * as shell from 'shelljs'

describe('basics', () => {

  it('enter ls and waitForData until it prints package.json file', async () => {
    const client = new Driver()
    await client.start()
    await client.enter('ls')
    const data = await client.waitForData(data => data.includes('package.json'))
    expect(data).toContain('package.json')
    expect(await client.getDataFromLastWrite()).toContain('package.json')
    const state = await client.dumpState()
    expect(state.data.length).toBeGreaterThan(0)
    await client.destroy()
  })
})
