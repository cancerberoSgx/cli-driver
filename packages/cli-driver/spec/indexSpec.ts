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

  xit('npm init instrumentation', async (done) => {
    shell.mkdir('test1')
    const client = new Driver()
    await client.start({ cwd: 'test1' })
    await client.enter('npm init')

    const answers = [
      { contains: 'description:', enter: 'my cool description' }
    ]

    await client.waitForData(data => data.includes('package name:'))
    await client.enter('my-cool-project')

    await client.waitForData(data => data.includes('version:'))
    await client.enter('0.0.1')

    await client.waitForData(data => data.includes('package name:'))
    await client.enter('my-cool-project')

//     description:
// entry point: (test.js)
//     test command:
// git repository:
// keywords:
// author:
// license: (ISC)

    // expect(data1).toContain('package.json')
  })
})
