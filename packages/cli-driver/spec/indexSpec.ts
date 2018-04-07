import Driver from '../src/index'
import * as shell from 'shelljs'

async function timeout (t) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}
describe('basics', () => {
  it('enter ls and getDataFromLastWrite should print the package.json file', async (done) => {
    const client = new Driver()
    await client.start()
    await client.enter('ls')
    await timeout(1000)
    expect(await client.getDataFromLastWrite()).toContain('package.json')
    await client.destroy()
    done()
  })

  // xit('npm init instrumentation', async (done) => {
  //   shell.mkdir('test1')

  //   const client = new Driver()
  //   await client.start({ cwd: 'test1' })
  //   await client.enter('npm init')

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
  // })
})
