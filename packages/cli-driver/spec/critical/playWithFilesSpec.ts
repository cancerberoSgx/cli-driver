import { Driver } from '../../src'

describe('lets play little with files, folders, paths, callbacks, timeouts, etc', () => {
  let client: Driver
  let data: any

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000
    client = new Driver()
    await client.start({
      // notSilent: true
    })
  })

  afterEach(async () => {
    await client.destroy()
  })

  it('enter ls and waitForData until it prints package.json file', async () => {
    try {
      await client.enter('ls *.json')
      data = await client.waitForData(data => data.includes('package.json'))
      expect(data).toContain('package.json')
      expect(data).toContain('tsconfig.json')
      expect(await client.getDataFromLastWrite()).toContain('package.json')
    } catch (ex) {
      fail('these particular commands should not throw errors')
    }
  })

  it('waiting for non existing files by default will return a rejected promise', async done => {
    try {
      await client.enter('ls *.png')
      const data = await client.waitForData(data => data.includes('batman.png'), 400, 50)
      fail('because we are using awaits so an exception should e thrown')
    } catch (error) {
      expect(error.type).toBe(Driver.ERROR_TYPE)
      return done()
    }
    fail('because we are using awaits, should enter in last catch and didnt')
  })

  it('waiting for non existing data passing rejectOnTimeout=false should not reject a promise but resolve with an error ', async () => {
    await client.enter('ls')
    data = await client.waitForData('nonexistentdata', 200, 50, undefined, false)
    expect(data.type).toBe(Driver.ERROR_TYPE)

    data = await client.waitForData({
      predicate: 'nonexistentdata',
      timeout: 400,
      interval: 50,
      rejectOnTimeout: false
    })
    expect(data.type).toBe(Driver.ERROR_TYPE)
  })
})
