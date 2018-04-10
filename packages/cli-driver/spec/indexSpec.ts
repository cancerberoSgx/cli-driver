import { Driver } from '../src'
import * as shell from 'shelljs'

describe('basics', () => {

  it('enter ls and waitForData until it prints package.json file', async (done) => {
    const client = new Driver()
    await client.start()
    await client.enter('ls')
    const data = await client.waitForData(data => data.includes('package.json'))
    expect(data).toContain('package.json')
    expect(await client.getDataFromLastWrite()).toContain('package.json')
    const state = await client.dumpState()
    expect(state.data.length).toBeGreaterThan(0)

    await client.enter('exit'); await client.waitTime(500)
    await client.destroy()
    done()
  })

  // it('try to spawn in the same process experiment', (done) => {
  //   const client = new Driver()

  //   client.start({
  //     uid: process.getuid(),
  //     gid: process.getgid(),
  //     env: process.env,
  //     notSilent: true
  //   })
  //   client.waitForData('hello').then(() => {
  //     console.log('worked!!')
  //     done()

  //     client.destroy()
  //   })

  //   setTimeout(() => {
  //     console.log('hello')
  //   }, 1000)
  // })

})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
