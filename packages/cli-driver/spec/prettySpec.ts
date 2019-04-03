import { Driver, ansi } from '../src/index'

describe('pretty specs for readme', () => {
  it('enter ls command should print package.json and tsconfig.json file', async done => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    const client = new Driver()
    client.start()
    client.enter('ls *.json')
    // now we wait until package.json is printed in stdout
    const data = await client.waitForData(data => data.includes('package.json'))
    expect(data).toContain('package.json')
    expect(data).toContain('tsconfig.json')
    await client.destroy()
    done()
  })

  it('same as before but without async/await just good-old then', done => {
    const client = new Driver()
    client.start()
    client.enter('ls *.json')
    // now we wait until package.json is printed in stdout
    client
      .waitForData(data => data.includes('package.json'))
      .then(data => {
        expect(data).toContain('package.json')
        expect(data).toContain('tsconfig.json')
        client.enter('exit')
        client.destroy()
        done()
      })
  })
})
