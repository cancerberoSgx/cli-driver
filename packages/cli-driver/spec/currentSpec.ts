// this is the spec in which we are working right now

import { Driver } from '../src'
import * as shell from 'shelljs'

describe('basics', () => {
  let client: Driver
  let data: any

  beforeAll(async () => {
    client = new Driver()
    await client.start()
    await client.waitTime(200)
  })

  afterAll(async () => {
    await client.destroy()
  })

  it('enter ls and waitForData until it prints package.json file', async () => {
    try {
      await client.enter('ls *.json')
      data = await client.waitForData(data => data.includes('package.json'), 400, 200)
      expect(data).toContain('package.json')
      expect(data).toContain('tsconfig.json')
      expect(await client.getDataFromLastWrite()).toContain('package.json')
    } catch (ex) {
      fail('these particular commands should not throw errors')
    }
  })

  it('waiting for non existing files by default will return a rejected promise', async (done) => {
    try {
      await client.enter('ls *.png')
      data = await client.waitForData(data => data.includes('batman.png'), 400, 200)
    } catch (error) {
      // if (!error) {
      //   console.log('hello')
      //   console.trace()
      //   debugger
      // }
      expect(data.type).toBe(Driver.ERROR_TYPE)
      return done()
    }
    fail('because we are using awaits, should enter in last catch and didnt')
  })

  it('waiting for non existing data passing rejectOnTimeout=false should not reject a promise but resolve with an error ', async () => {
    await client.enter('ls')
    data = await client.waitForData('nonexistentdata', 200, 50, undefined, false)
    expect(data.type).toBe(Driver.ERROR_TYPE)

    data = await client.waitForData({ predicate: 'nonexistentdata', timeout: 400, interval: 200, rejectOnTimeout: false })
    expect(data.type).toBe(Driver.ERROR_TYPE)

    const state = await client.dumpState()
    expect(state.data.length).toBeGreaterThan(0)

    await client.destroy()

  })

  // xit('make sure timeout dont take more that it should... ', () => {})
  // xit('interval should call predicate more or less the correct times', () => {})
  // xit(play a little bit with cd mkdir cd .. pwd to see how well behaves. )
})
