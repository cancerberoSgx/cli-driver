import Driver from '../src/index'
import * as shell from 'shelljs'

describe('index', () => {
  it('enter ls should print package.json file', async (done) => {
    const client = new Driver()
    await client.start()
    setTimeout(async () => {
      client.enter('ls')
      setTimeout(async () => {

        let data = await client.getAllData()
        console.log('ALL DATA', data)
        expect(typeof data).toContain('string')
        done()
      }, 500)

    }, 200)
  })

  xit('npm init instrumentation', async (done) => {
    shell.mkdir('test1')

    const client = new Driver()
    await client.start({ cwd: 'test1' })
    await client.enter('npm init')

    // const answers = [
    //   {contains: 'description:', enter: 'my cool description'}
    // ]

    // await client.waitForData(data => data.includes('package name:'))
    // await client.enter('my-cool-project')

    // await client.waitForData(data => data.includes('version:'))
    // await client.enter('0.0.1')

    // await client.waitForData(data => data.includes('package name:'))
    // await client.enter('my-cool-project')

//     description:
// entry point: (test.js)
//     test command:
// git repository:
// keywords:
// author:
// license: (ISC)

//     expect(data1).toContain('package.json')
  })
})
