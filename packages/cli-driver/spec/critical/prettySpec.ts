import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { Driver } from '../../src/index'

describe('pretty specs for readme', () => {

  it('different ways of create files and waiting they exists', async done => {
    execSync('rm -rf tmpFile*.txt')
    const client = await new Driver().start()
    let output = await client.enterAndWait('ls -a', '..')
    expect(output).not.toContain('tmpFile')
    await client.enterAndWait('echo hello > tmpFile1.txt', d => existsSync('tmpFile1.txt'))
    await client.enterAndWait('echo hello > tmpFile2.txt && echo tmpFile2', 'tmpFile2')
    // await client.enterAndWait('echo hello > tmpFile3.txt', async d=>{tmp Promise(resolve=>existsSync('tmpFile3.txt')&&resolve())})
    await client.destroy()
    done()
  })

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
